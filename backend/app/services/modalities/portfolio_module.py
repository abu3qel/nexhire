import re
from typing import Optional
from urllib.parse import urljoin, urlparse
import httpx
from bs4 import BeautifulSoup
from app.services.llm_utils import call_llm_json

PROJECT_PATTERNS = re.compile(r"/(project|work|case-study|portfolio|showcase|apps?)/", re.I)


async def analyse_portfolio(portfolio_url: Optional[str], job_description: str) -> Optional[dict]:
    if not portfolio_url:
        return None

    try:
        main_text, extra_links = await _scrape_page(portfolio_url)
    except Exception:
        return None

    all_text = main_text

    # Scrape up to 3 project sub-pages
    scraped_extras = 0
    for link in extra_links:
        if scraped_extras >= 3:
            break
        if PROJECT_PATTERNS.search(link):
            try:
                page_text, _ = await _scrape_page(link)
                all_text += "\n\n" + page_text
                scraped_extras += 1
            except Exception:
                continue

    # Truncate to 8000 chars
    all_text = all_text[:8000]

    system_prompt = (
        "You are a technical recruiter evaluating a developer portfolio. "
        "Analyse the portfolio content and return ONLY valid JSON: "
        "projects_found (int): estimated number of distinct projects, "
        "technologies (list of strings): all technologies/frameworks mentioned, "
        "complexity_score (0.0-1.0): assessed project complexity and technical depth, "
        "relevance_score (0.0-1.0): relevance to the job description provided, "
        "summary (string): 2-3 sentence assessment"
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
        },
        "scraped_text": all_text,
    }


async def _scrape_page(url: str) -> tuple[str, list[str]]:
    async with httpx.AsyncClient(timeout=15.0, follow_redirects=True) as client:
        resp = await client.get(url, headers={"User-Agent": "Mozilla/5.0"})
        resp.raise_for_status()

    soup = BeautifulSoup(resp.text, "html.parser")

    # Remove nav/footer/script/style
    for tag in soup(["nav", "footer", "script", "style", "noscript"]):
        tag.decompose()

    text = soup.get_text(separator="\n", strip=True)

    # Collect internal links
    base = urlparse(url)
    links = []
    for a in soup.find_all("a", href=True):
        href = a["href"]
        if href.startswith("http"):
            parsed = urlparse(href)
            if parsed.netloc == base.netloc:
                links.append(href)
        elif href.startswith("/"):
            links.append(urljoin(url, href))

    return text, list(set(links))
