import json
import re
from typing import Optional
from urllib.parse import urljoin, urlparse
import httpx
from bs4 import BeautifulSoup
from app.services.llm_utils import call_llm_json

# Expanded URL patterns for project/work pages
PROJECT_PATTERNS = re.compile(
    r"/(project|work|case-study|portfolio|showcase|apps?|built|making|demo|product|experiment)/",
    re.I,
)

# Additional patterns for top-level sections worth scraping
SECTION_PATTERNS = re.compile(
    r"/(about|skills?|experience|labs?|research|open-source)/",
    re.I,
)


async def analyse_portfolio(portfolio_url: Optional[str], job_description: str) -> Optional[dict]:
    if not portfolio_url:
        return None

    try:
        main_text, extra_links, og_meta = await _scrape_page(portfolio_url)
    except Exception:
        return None

    all_text = main_text
    pages_scraped = 1

    # Prioritise project-pattern links, then section-pattern links
    project_links = [l for l in extra_links if PROJECT_PATTERNS.search(l)]
    section_links = [l for l in extra_links if SECTION_PATTERNS.search(l) and l not in project_links]
    ordered_links = project_links + section_links

    for link in ordered_links:
        if pages_scraped >= 5:
            break
        try:
            page_text, _, _ = await _scrape_page(link)
            all_text += "\n\n" + page_text
            pages_scraped += 1
        except Exception:
            continue

    # Prepend OpenGraph/meta info (authoritative structured data)
    if og_meta:
        all_text = og_meta + "\n\n" + all_text

    # Deduplicate repeated lines (common in portfolio sites with repeated nav text)
    all_text = _deduplicate_lines(all_text)

    # Truncate to 10000 chars (up from 8000 to capture more content)
    all_text = all_text[:10000]

    system_prompt = (
        "You are a technical recruiter evaluating a developer portfolio. "
        "Analyse the portfolio content and return ONLY valid JSON with these exact keys: "
        "projects_found (int): estimated number of distinct projects shown, "
        "technologies (list of strings): all technologies/frameworks/languages mentioned, "
        "complexity_score (0.0-1.0): assessed project complexity and technical depth, "
        "relevance_score (0.0-1.0): relevance to the job description provided, "
        "summary (string): 2-3 sentence assessment of the portfolio"
    )
    user_prompt = f"Job Description:\n{job_description}\n\nPortfolio Content:\n{all_text}"

    result = await call_llm_json(system_prompt, user_prompt)

    complexity = max(0.0, min(1.0, float(result.get("complexity_score", 0.5))))
    relevance = max(0.0, min(1.0, float(result.get("relevance_score", 0.5))))
    score = 0.5 * complexity + 0.5 * relevance

    return {
        "score": score,
        "details": {
            "projects_found": result.get("projects_found", 0),
            "technologies": result.get("technologies", []),
            "complexity_score": complexity,
            "relevance_score": relevance,
            "llm_summary": result.get("summary", ""),
            "pages_scraped": pages_scraped,
        },
        "scraped_text": all_text,
    }


async def _scrape_page(url: str) -> tuple[str, list[str], str]:
    """
    Returns (text, internal_links, og_meta_string).
    Tries plain httpx first; falls back to a JS-rendering hint via User-Agent spoofing
    if the page returns very little text (likely client-side rendered).
    """
    headers = {
        "User-Agent": (
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/124.0.0.0 Safari/537.36"
        ),
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
    }

    async with httpx.AsyncClient(timeout=20.0, follow_redirects=True) as client:
        resp = await client.get(url, headers=headers)
        resp.raise_for_status()

    soup = BeautifulSoup(resp.text, "html.parser")

    # Extract OpenGraph / JSON-LD structured data before removing tags
    og_meta = _extract_structured_meta(soup)

    # Remove boilerplate tags
    for tag in soup(["nav", "footer", "script", "style", "noscript", "header", "aside"]):
        tag.decompose()

    text = soup.get_text(separator="\n", strip=True)

    # Collect internal links
    base = urlparse(url)
    links: list[str] = []
    for a in soup.find_all("a", href=True):
        href = a["href"]
        if href.startswith("http"):
            parsed = urlparse(href)
            if parsed.netloc == base.netloc:
                links.append(href)
        elif href.startswith("/"):
            links.append(urljoin(url, href))
        # Ignore fragment-only and mailto: links

    return text, list(set(links)), og_meta


def _extract_structured_meta(soup: BeautifulSoup) -> str:
    """Extract OpenGraph tags and JSON-LD schema data as a summary string."""
    parts: list[str] = []

    # OpenGraph / Twitter card meta tags
    og_keys = {"og:title", "og:description", "twitter:title", "twitter:description", "description"}
    for tag in soup.find_all("meta"):
        prop = tag.get("property", "") or tag.get("name", "")
        content = tag.get("content", "")
        if prop.lower() in og_keys and content:
            parts.append(f"{prop}: {content}")

    # JSON-LD (schema.org) — often contains structured project/person data
    for script in soup.find_all("script", type="application/ld+json"):
        try:
            data = json.loads(script.string or "")
            if isinstance(data, dict):
                for key in ("name", "description", "skills", "knowsAbout", "jobTitle"):
                    val = data.get(key)
                    if val and isinstance(val, str):
                        parts.append(f"{key}: {val}")
                    elif val and isinstance(val, list):
                        parts.append(f"{key}: {', '.join(str(v) for v in val[:10])}")
        except Exception:
            pass

    return "\n".join(parts)


def _deduplicate_lines(text: str) -> str:
    """Remove consecutive duplicate lines (common in SPAs with repeated nav content)."""
    seen: set[str] = set()
    result: list[str] = []
    for line in text.splitlines():
        stripped = line.strip()
        if stripped and stripped not in seen:
            seen.add(stripped)
            result.append(line)
    return "\n".join(result)
