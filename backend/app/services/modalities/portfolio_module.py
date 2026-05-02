import json
import logging
from typing import Optional
from urllib.parse import urljoin, urlparse
import httpx
from bs4 import BeautifulSoup
from app.services.llm_utils import call_llm_json

logger = logging.getLogger(__name__)

_SKIP_EXTENSIONS = {
    ".xml", ".json", ".pdf", ".png", ".jpg", ".jpeg", ".gif",
    ".svg", ".ico", ".css", ".js", ".woff", ".woff2", ".ttf",
}

_SKIP_SUBSTRINGS = {
    "#", "mailto:", "tel:", "/rss", "/feed", "/sitemap",
    "/tag/", "/category/", "/categories/", "/tags/", "/page/",
    "/wp-admin", "/cdn-cgi",
}


def _is_content_url(url: str) -> bool:
    lower = url.lower()
    if any(lower.endswith(ext) for ext in _SKIP_EXTENSIONS):
        return False
    if any(fragment in lower for fragment in _SKIP_SUBSTRINGS):
        return False
    return True


async def analyse_portfolio(portfolio_url: Optional[str], job_description: str) -> Optional[dict]:
    if not portfolio_url:
        return None

    try:
        main_text, extra_links, og_meta = await _scrape_page(portfolio_url)
    except Exception:
        return None

    all_text = main_text
    pages_scraped = 1

    ordered_links = [l for l in extra_links if _is_content_url(l)]

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
    Stage 1: plain httpx fetch — fast and sufficient for SSR/static sites.
    Stage 2: Playwright headless Chromium fallback for JS-rendered SPAs when
             httpx returns fewer than 10 meaningful lines of content.
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

    httpx_result = _parse_html(resp.text, url)
    meaningful_lines = len([l for l in httpx_result[0].splitlines() if len(l.strip()) > 30])
    if meaningful_lines >= 10:
        return httpx_result

    # Stage 2 — JS-rendered SPA: use Playwright to get fully hydrated HTML
    logger.info("Portfolio httpx returned %d meaningful lines for %s — trying Playwright", meaningful_lines, url)
    try:
        from playwright.async_api import async_playwright
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            page = await browser.new_page()
            await page.goto(url, timeout=20000, wait_until="networkidle")
            await page.wait_for_timeout(2000)
            html = await page.content()
            await browser.close()
        pw_result = _parse_html(html, url)
        logger.info("Playwright succeeded for %s", url)
        return pw_result
    except Exception as exc:
        logger.warning("Playwright fallback failed for %s: %s", url, exc)
        return httpx_result


def _parse_html(html: str, url: str) -> tuple[str, list[str], str]:
    """Parse raw HTML into (text, internal_links, og_meta_string)."""
    soup = BeautifulSoup(html, "html.parser")

    # Extract OpenGraph / JSON-LD structured data before removing tags
    og_meta = _extract_structured_meta(soup)

    # Collect internal links before decomposing nav/footer/header/aside so
    # that navigation links (which often point to project and section pages)
    # are not lost.
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

    # Remove boilerplate tags before text extraction
    for tag in soup(["nav", "footer", "script", "style", "noscript", "header", "aside"]):
        tag.decompose()

    text = soup.get_text(separator="\n", strip=True)

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
