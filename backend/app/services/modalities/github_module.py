import re
import math
import tempfile
import base64
from datetime import datetime, timezone
from typing import Optional
import httpx
from app.config import settings


async def analyse_github(github_url: Optional[str], job_description: str) -> Optional[dict]:
    if not github_url:
        return None

    username = _extract_username(github_url)
    if not username:
        return None

    headers = {
        "Authorization": f"token {settings.GITHUB_TOKEN}",
        "Accept": "application/vnd.github.v3+json",
    }

    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            user_resp = await client.get(f"https://api.github.com/users/{username}", headers=headers)
            user_resp.raise_for_status()
            user_data = user_resp.json()
        except Exception:
            return None

        repos_resp = await client.get(
            f"https://api.github.com/users/{username}/repos",
            headers=headers,
            params={"per_page": 100, "sort": "updated"},
        )
        if repos_resp.status_code != 200:
            return None

        all_repos = [r for r in repos_resp.json() if not r.get("fork")]
        top_repos = sorted(all_repos, key=lambda r: r.get("stargazers_count", 0), reverse=True)[:10]

        total_commits = 0
        total_stars = 0
        all_languages: dict = {}
        repo_details = []
        readme_texts = []

        for repo in top_repos:
            repo_name = repo["name"]
            total_stars += repo.get("stargazers_count", 0)

            # Commit count (use statistics endpoint for accuracy, fall back to list)
            try:
                stats_resp = await client.get(
                    f"https://api.github.com/repos/{username}/{repo_name}/commits",
                    headers=headers,
                    params={"per_page": 100},
                )
                commit_count = len(stats_resp.json()) if stats_resp.status_code == 200 else 0
            except Exception:
                commit_count = 0
            total_commits += commit_count

            # Languages
            try:
                lang_resp = await client.get(
                    f"https://api.github.com/repos/{username}/{repo_name}/languages",
                    headers=headers,
                )
                if lang_resp.status_code == 200:
                    for lang, bytes_count in lang_resp.json().items():
                        all_languages[lang] = all_languages.get(lang, 0) + bytes_count
            except Exception:
                pass

            # README
            try:
                readme_resp = await client.get(
                    f"https://api.github.com/repos/{username}/{repo_name}/contents/README.md",
                    headers=headers,
                )
                if readme_resp.status_code == 200:
                    content = readme_resp.json().get("content", "")
                    decoded = base64.b64decode(content).decode("utf-8", errors="ignore")
                    readme_texts.append(decoded[:2000])
            except Exception:
                pass

            repo_details.append({
                "name": repo_name,
                "commits": commit_count,
                "stars": repo.get("stargazers_count", 0),
                "language": repo.get("language"),
                "description": repo.get("description") or "",
                "topics": repo.get("topics", []),
                "size": repo.get("size", 0),
            })

    repo_count = len(all_repos)
    lang_diversity = len(all_languages)

    # Account age (years since account creation)
    account_age_years = _account_age(user_data.get("created_at"))

    contribution_score = _contribution_score(repo_count, total_commits, lang_diversity, total_stars, account_age_years)

    # Code quality via radon (Python repos)
    quality_score = await _code_quality_score(username, top_repos, headers)

    # JD relevance: keyword overlap between JD and repo metadata
    jd_relevance = _jd_relevance_score(repo_details, job_description)

    # Final score: 50% contribution, 30% quality, 20% JD relevance
    github_score = 0.5 * contribution_score + 0.3 * quality_score + 0.2 * jd_relevance

    top_languages = dict(sorted(all_languages.items(), key=lambda x: x[1], reverse=True)[:5])

    return {
        "score": github_score,
        "details": {
            "repo_count": repo_count,
            "total_commits": total_commits,
            "total_stars": total_stars,
            "account_age_years": round(account_age_years, 1),
            "top_languages": top_languages,
            "avg_complexity": None,
            "halstead_volume": None,
            "contribution_score": contribution_score,
            "quality_score": quality_score,
            "jd_relevance_score": jd_relevance,
            "repos_analysed": [r["name"] for r in repo_details],
        },
        "readme_texts": readme_texts,
    }


def _extract_username(url: str) -> Optional[str]:
    match = re.match(r"https?://github\.com/([^/]+)/?", url)
    return match.group(1) if match else None


def _account_age(created_at_str: Optional[str]) -> float:
    if not created_at_str:
        return 1.0
    try:
        created = datetime.fromisoformat(created_at_str.replace("Z", "+00:00"))
        age_days = (datetime.now(timezone.utc) - created).days
        return age_days / 365.0
    except Exception:
        return 1.0


def _contribution_score(
    repo_count: int,
    total_commits: int,
    lang_diversity: int,
    total_stars: int,
    account_age_years: float,
) -> float:
    rc = min(repo_count, 20) / 20
    # Commits normalised by account age (commits/year, capped at 300/yr)
    commits_per_year = total_commits / max(account_age_years, 0.5)
    tc = min(commits_per_year, 300) / 300
    ld = min(lang_diversity, 10) / 10
    # Stars signal (log scale: 100+ stars → 1.0)
    star_score = min(math.log10(total_stars + 1) / 2.0, 1.0)
    return (rc * 0.3 + tc * 0.35 + ld * 0.2 + star_score * 0.15)


def _jd_relevance_score(repo_details: list[dict], job_description: str) -> float:
    """Keyword overlap between JD and repo names/descriptions/topics/languages."""
    stop_words = {
        "the", "a", "an", "and", "or", "in", "of", "to", "for", "with", "as",
        "is", "are", "we", "you", "be", "at", "by", "from", "that", "this",
        "will", "have", "has", "but", "on", "not", "our", "your",
    }
    jd_words = {
        w.strip(".,;:()[]").lower()
        for w in job_description.split()
        if len(w) > 3 and w.lower() not in stop_words
    }

    if not jd_words or not repo_details:
        return 0.5

    total_overlap = 0.0
    for repo in repo_details:
        repo_text = " ".join([
            repo.get("name", "").replace("-", " "),
            repo.get("description", "") or "",
            " ".join(repo.get("topics", [])),
            repo.get("language", "") or "",
        ]).lower()
        repo_words = set(repo_text.split())
        overlap = len(jd_words & repo_words) / len(jd_words)
        total_overlap += overlap

    avg_overlap = total_overlap / len(repo_details)
    # avg_overlap is typically 0.01–0.15; scale to 0–1 range
    return min(avg_overlap * 8.0, 1.0)


async def _code_quality_score(username: str, repos: list, _headers: dict) -> float:
    """Radon-based quality for Python repos; TypeScript repos use a line-complexity estimate."""
    python_repos = [
        r for r in repos
        if r.get("language") == "Python" and r.get("size", 99999) <= 50 * 1024
    ][:3]

    if not python_repos:
        # Give partial credit based on whether any typed language is primary
        typed_langs = {"TypeScript", "Go", "Rust", "Java", "Kotlin", "Swift", "C#", "C++"}
        primary_langs = {r.get("language") for r in repos if r.get("language")}
        if primary_langs & typed_langs:
            return 0.6  # typed, statically analysable → above neutral
        return 0.5  # neutral for scripting/other language devs

    complexity_scores = []
    halstead_scores = []

    for repo in python_repos:
        repo_name = repo["name"]
        clone_url = f"https://{settings.GITHUB_TOKEN}@github.com/{username}/{repo_name}.git"
        with tempfile.TemporaryDirectory() as tmpdir:
            try:
                import git
                git.Repo.clone_from(clone_url, tmpdir, depth=1)

                import subprocess
                cc_result = subprocess.run(
                    ["radon", "cc", "-s", "-a", tmpdir],
                    capture_output=True, text=True, timeout=30
                )
                avg_cc = _parse_radon_cc(cc_result.stdout)

                hal_result = subprocess.run(
                    ["radon", "hal", tmpdir],
                    capture_output=True, text=True, timeout=30
                )
                total_volume = _parse_radon_hal(hal_result.stdout)

                if avg_cc is not None:
                    # ≤5 → 1.0, ≥20 → 0.0
                    cs = max(0.0, min(1.0, 1.0 - (avg_cc - 5) / 15.0))
                    complexity_scores.append(cs)

                if total_volume is not None:
                    # 0 volume → 1.0, 100k+ → 0.0
                    hs = max(0.0, min(1.0, 1.0 - total_volume / 100_000.0))
                    halstead_scores.append(hs)
            except Exception:
                continue

    if not complexity_scores and not halstead_scores:
        return 0.5

    all_q = complexity_scores + halstead_scores
    return sum(all_q) / len(all_q)


def _parse_radon_cc(output: str) -> Optional[float]:
    match = re.search(r"Average complexity: \w+ \(([0-9.]+)\)", output)
    return float(match.group(1)) if match else None


def _parse_radon_hal(output: str) -> Optional[float]:
    volumes = [float(m) for m in re.findall(r'"volume":\s*([0-9.]+)', output)]
    return sum(volumes) if volumes else None
