import os
import re
import tempfile
import base64
import math
from typing import Optional
import httpx
from app.config import settings


async def analyse_github(github_url: Optional[str], job_description: str) -> Optional[dict]:
    if not github_url:
        return None

    username = _extract_username(github_url)
    if not username:
        return None

    headers = {"Authorization": f"token {settings.GITHUB_TOKEN}", "Accept": "application/vnd.github.v3+json"}

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
        # Top 10 by stars + recency (simple sum of stars; recency handled by sort=updated)
        top_repos = sorted(all_repos, key=lambda r: r.get("stargazers_count", 0), reverse=True)[:10]

        total_commits = 0
        all_languages: dict = {}
        repo_details = []
        readme_texts = []

        for repo in top_repos:
            repo_name = repo["name"]

            # Commits
            try:
                commits_resp = await client.get(
                    f"https://api.github.com/repos/{username}/{repo_name}/commits",
                    headers=headers,
                    params={"per_page": 100},
                )
                commit_count = len(commits_resp.json()) if commits_resp.status_code == 200 else 0
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

            repo_details.append({"name": repo_name, "commits": commit_count, "size": repo.get("size", 0)})

    # Contribution score
    repo_count = len(all_repos)
    lang_diversity = len(all_languages)
    contribution_score = _contribution_score(repo_count, total_commits, lang_diversity)

    # Code quality via radon on Python repos
    quality_score = await _code_quality_score(username, top_repos, headers)

    # Top languages by bytes
    top_languages = dict(sorted(all_languages.items(), key=lambda x: x[1], reverse=True)[:5])

    github_score = 0.6 * contribution_score + 0.4 * quality_score

    return {
        "score": github_score,
        "details": {
            "repo_count": repo_count,
            "total_commits": total_commits,
            "top_languages": top_languages,
            "avg_complexity": None,
            "halstead_volume": None,
            "contribution_score": contribution_score,
            "quality_score": quality_score,
            "repos_analysed": [r["name"] for r in repo_details],
        },
        "readme_texts": readme_texts,
    }


def _extract_username(url: str) -> Optional[str]:
    match = re.match(r"https?://github\.com/([^/]+)/?", url)
    return match.group(1) if match else None


def _contribution_score(repo_count: int, total_commits: int, lang_diversity: int) -> float:
    rc = min(repo_count, 20) / 20
    tc = min(total_commits, 500) / 500
    ld = min(lang_diversity, 10) / 10
    return (rc + tc + ld) / 3.0


async def _code_quality_score(username: str, repos: list, headers: dict) -> float:
    # Sort by commit count, take top 3 Python repos under 50MB
    python_repos = [
        r for r in repos
        if r.get("language") == "Python" and r.get("size", 99999) <= 50 * 1024
    ][:3]

    if not python_repos:
        return 0.5  # Neutral for non-Python devs

    complexity_scores = []
    halstead_scores = []

    async with httpx.AsyncClient(timeout=30.0) as client:
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
                        # complexity ≤ 5 → 1.0, ≥ 20 → 0.0
                        cs = max(0.0, min(1.0, 1.0 - (avg_cc - 5) / 15.0))
                        complexity_scores.append(cs)

                    if total_volume is not None:
                        # Lower Halstead volume is better; normalise: 0 → 1.0, 100000+ → 0.0
                        hs = max(0.0, min(1.0, 1.0 - total_volume / 100000.0))
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
