import re
import math
import os
import json
import logging
import shutil
import subprocess
import tempfile
import base64
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from typing import Optional
import httpx
from app.config import settings

logger = logging.getLogger(__name__)

_SIZE_LIMIT_KB = 50 * 1024  # 50 MB — same guard applied to all languages


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

    # Code quality — multi-language analysis weighted by bytes per language family
    quality_score = await _code_quality_score(username, top_repos, headers, all_languages)

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


# ---------------------------------------------------------------------------
# Multi-language code quality analysis
# ---------------------------------------------------------------------------

_LANGUAGE_GROUPS: dict[str, tuple[str, ...]] = {
    "python": ("Python",),
    "js_ts":  ("JavaScript", "TypeScript"),
    "java":   ("Java",),
    "go":     ("Go",),
    "rust":   ("Rust",),
    "c_cpp":  ("C", "C++"),
}

_CI_TOPICS = {
    "github-actions", "travis-ci", "circleci", "ci", "cd",
    "continuous-integration", "continuous-delivery", "actions",
}


async def _code_quality_score(
    username: str,
    repos: list,
    _headers: dict,
    all_languages: dict | None = None,
) -> float:
    """
    Analyse code quality across all common languages.
    Each language family is scored independently then combined using a
    byte-weighted mean so the dominant language in the profile contributes most.
    """
    all_languages = all_languages or {}

    # Group repos by language family; keep top 3 per group by stars
    grouped: dict[str, list] = {g: [] for g in _LANGUAGE_GROUPS}
    other_repos: list = []

    for repo in repos:
        lang = repo.get("language") or ""
        placed = False
        for group, langs in _LANGUAGE_GROUPS.items():
            if lang in langs:
                grouped[group].append(repo)
                placed = True
                break
        if not placed and lang:
            other_repos.append(repo)

    for group in grouped:
        grouped[group] = sorted(
            grouped[group], key=lambda r: r.get("stargazers_count", 0), reverse=True
        )[:3]

    # Analyse each group and collect scores
    group_scores: dict[str, float] = {}

    if grouped["python"]:
        scores = []
        for repo in grouped["python"]:
            s = await _analyse_python_repo(username, repo)
            if s is not None:
                scores.append(s)
        if scores:
            group_scores["python"] = sum(scores) / len(scores)
            logger.info("GitHub quality [python] %.3f from %d repo(s)", group_scores["python"], len(scores))

    if grouped["js_ts"]:
        scores = []
        for repo in grouped["js_ts"]:
            scores.append(await _analyse_js_ts_repo(username, repo))
        group_scores["js_ts"] = sum(scores) / len(scores)
        logger.info("GitHub quality [js_ts] %.3f from %d repo(s)", group_scores["js_ts"], len(scores))

    if grouped["java"]:
        scores = []
        for repo in grouped["java"]:
            scores.append(await _analyse_java_repo(username, repo))
        group_scores["java"] = sum(scores) / len(scores)
        logger.info("GitHub quality [java] %.3f from %d repo(s)", group_scores["java"], len(scores))

    if grouped["go"]:
        scores = []
        for repo in grouped["go"]:
            scores.append(await _analyse_go_repo(username, repo))
        group_scores["go"] = sum(scores) / len(scores)
        logger.info("GitHub quality [go] %.3f from %d repo(s)", group_scores["go"], len(scores))

    if grouped["rust"]:
        scores = []
        for repo in grouped["rust"]:
            scores.append(await _analyse_rust_repo(username, repo))
        group_scores["rust"] = sum(scores) / len(scores)
        logger.info("GitHub quality [rust] %.3f from %d repo(s)", group_scores["rust"], len(scores))

    if grouped["c_cpp"]:
        scores = []
        for repo in grouped["c_cpp"]:
            scores.append(await _analyse_c_cpp_repo(username, repo))
        group_scores["c_cpp"] = sum(scores) / len(scores)
        logger.info("GitHub quality [c_cpp] %.3f from %d repo(s)", group_scores["c_cpp"], len(scores))

    if other_repos:
        group_scores["other"] = _other_lang_heuristic(other_repos[:3])
        logger.info("GitHub quality [other] %.3f (heuristic)", group_scores["other"])

    if not group_scores:
        return 0.5

    # Byte weights per group — dominant language drives the final score
    known_langs: set[str] = {l for langs in _LANGUAGE_GROUPS.values() for l in langs}
    byte_weights: dict[str, float] = {
        "python": all_languages.get("Python", 0),
        "js_ts":  all_languages.get("JavaScript", 0) + all_languages.get("TypeScript", 0),
        "java":   all_languages.get("Java", 0),
        "go":     all_languages.get("Go", 0),
        "rust":   all_languages.get("Rust", 0),
        "c_cpp":  all_languages.get("C", 0) + all_languages.get("C++", 0),
        "other":  sum(v for k, v in all_languages.items() if k not in known_langs),
    }

    total_bytes = sum(byte_weights.get(g, 0) for g in group_scores)
    if total_bytes == 0:
        return sum(group_scores.values()) / len(group_scores)

    weighted = sum(group_scores[g] * byte_weights.get(g, 0) for g in group_scores)
    return max(0.0, min(1.0, weighted / total_bytes))


# ---------------------------------------------------------------------------
# Per-language analysers
# ---------------------------------------------------------------------------

def _ratio_score(count: int, denom: int, max_ratio: float) -> float:
    """0 issues → 1.0; count/denom >= max_ratio → 0.0; linear between."""
    if denom == 0:
        return 0.5
    return max(0.0, 1.0 - (count / denom) / max_ratio)


def _count_files(directory: str, extension: str) -> int:
    total = 0
    for _, _, files in os.walk(directory):
        total += sum(1 for f in files if f.endswith(extension))
    return total


async def _analyse_python_repo(username: str, repo: dict) -> Optional[float]:
    if repo.get("size", 99999) > _SIZE_LIMIT_KB:
        return None
    clone_url = f"https://{settings.GITHUB_TOKEN}@github.com/{username}/{repo['name']}.git"
    with tempfile.TemporaryDirectory() as tmpdir:
        try:
            import git
            git.Repo.clone_from(clone_url, tmpdir, depth=1)

            cc_result = subprocess.run(
                ["radon", "cc", "-s", "-a", tmpdir],
                capture_output=True, text=True, timeout=60,
            )
            avg_cc = _parse_radon_cc(cc_result.stdout)

            hal_result = subprocess.run(
                ["radon", "hal", tmpdir],
                capture_output=True, text=True, timeout=60,
            )
            total_volume = _parse_radon_hal(hal_result.stdout)

            scores = []
            if avg_cc is not None:
                scores.append(max(0.0, min(1.0, 1.0 - (avg_cc - 5) / 15.0)))
            if total_volume is not None:
                scores.append(max(0.0, min(1.0, 1.0 - total_volume / 100_000.0)))

            result = sum(scores) / len(scores) if scores else None
            logger.debug("Python radon %s/%s → %s", username, repo["name"], result)
            return result
        except Exception as exc:
            logger.debug("Python radon failed for %s/%s: %s", username, repo["name"], exc)
            return None


async def _analyse_js_ts_repo(username: str, repo: dict) -> float:
    if repo.get("size", 99999) > _SIZE_LIMIT_KB:
        return 0.55
    clone_url = f"https://{settings.GITHUB_TOKEN}@github.com/{username}/{repo['name']}.git"
    with tempfile.TemporaryDirectory() as tmpdir:
        try:
            import git
            git.Repo.clone_from(clone_url, tmpdir, depth=1)

            result = subprocess.run(
                [
                    "npx", "--yes", "eslint",
                    "--no-eslintrc",
                    "--rule", '{"complexity": ["warn", 5]}',
                    "--ext", ".js,.ts,.jsx,.tsx",
                    "--format", "json",
                    tmpdir,
                ],
                capture_output=True, text=True, timeout=60,
            )
            try:
                data = json.loads(result.stdout)
            except Exception:
                return 0.55

            complexity_warnings = sum(
                sum(1 for m in f.get("messages", []) if m.get("ruleId") == "complexity")
                for f in data
            )
            file_count = len(data)
            score = _ratio_score(complexity_warnings, max(file_count, 1), 3.0)
            logger.debug(
                "JS/TS eslint %s/%s: %d warnings / %d files → %.3f",
                username, repo["name"], complexity_warnings, file_count, score,
            )
            return score
        except Exception as exc:
            logger.debug("JS/TS eslint failed for %s/%s: %s", username, repo["name"], exc)
            return 0.55


async def _analyse_java_repo(username: str, repo: dict) -> float:
    if not shutil.which("pmd"):
        return 0.55
    if repo.get("size", 99999) > _SIZE_LIMIT_KB:
        return 0.55
    clone_url = f"https://{settings.GITHUB_TOKEN}@github.com/{username}/{repo['name']}.git"
    with tempfile.TemporaryDirectory() as tmpdir:
        try:
            import git
            git.Repo.clone_from(clone_url, tmpdir, depth=1)

            result = subprocess.run(
                ["pmd", "check", "-d", tmpdir, "-R", "rulesets/java/design.xml", "-f", "json"],
                capture_output=True, text=True, timeout=60,
            )
            try:
                data = json.loads(result.stdout)
                violations = sum(len(f.get("violations", [])) for f in data.get("files", []))
            except Exception:
                return 0.55

            java_files = _count_files(tmpdir, ".java")
            score = _ratio_score(violations, max(java_files, 1), 3.0)
            logger.debug(
                "Java PMD %s/%s: %d violations / %d files → %.3f",
                username, repo["name"], violations, java_files, score,
            )
            return score
        except Exception as exc:
            logger.debug("Java PMD failed for %s/%s: %s", username, repo["name"], exc)
            return 0.55


async def _analyse_go_repo(username: str, repo: dict) -> float:
    if not shutil.which("gocyclo"):
        return 0.55
    if repo.get("size", 99999) > _SIZE_LIMIT_KB:
        return 0.55
    clone_url = f"https://{settings.GITHUB_TOKEN}@github.com/{username}/{repo['name']}.git"
    with tempfile.TemporaryDirectory() as tmpdir:
        try:
            import git
            git.Repo.clone_from(clone_url, tmpdir, depth=1)

            result = subprocess.run(
                ["gocyclo", "-over", "5", tmpdir],
                capture_output=True, text=True, timeout=60,
            )
            over_threshold = len([l for l in result.stdout.strip().splitlines() if l.strip()])
            go_files = _count_files(tmpdir, ".go")
            score = _ratio_score(over_threshold, max(go_files, 1), 2.0)
            logger.debug(
                "Go gocyclo %s/%s: %d over-threshold / %d files → %.3f",
                username, repo["name"], over_threshold, go_files, score,
            )
            return score
        except Exception as exc:
            logger.debug("Go gocyclo failed for %s/%s: %s", username, repo["name"], exc)
            return 0.55


async def _analyse_rust_repo(username: str, repo: dict) -> float:
    if not shutil.which("cargo"):
        return 0.55
    if repo.get("size", 99999) > _SIZE_LIMIT_KB:
        return 0.55
    clone_url = f"https://{settings.GITHUB_TOKEN}@github.com/{username}/{repo['name']}.git"
    with tempfile.TemporaryDirectory() as tmpdir:
        try:
            import git
            git.Repo.clone_from(clone_url, tmpdir, depth=1)

            result = subprocess.run(
                ["cargo", "clippy", "--message-format", "json"],
                capture_output=True, text=True, timeout=60,
                cwd=tmpdir,
            )
            warnings = 0
            for line in result.stdout.splitlines():
                try:
                    msg = json.loads(line)
                    if (
                        msg.get("reason") == "compiler-message"
                        and msg.get("message", {}).get("level") == "warning"
                    ):
                        warnings += 1
                except Exception:
                    pass

            rs_files = _count_files(tmpdir, ".rs")
            score = _ratio_score(warnings, max(rs_files, 1), 3.0)
            logger.debug(
                "Rust clippy %s/%s: %d warnings / %d files → %.3f",
                username, repo["name"], warnings, rs_files, score,
            )
            return score
        except Exception as exc:
            logger.debug("Rust clippy failed for %s/%s: %s", username, repo["name"], exc)
            return 0.55


async def _analyse_c_cpp_repo(username: str, repo: dict) -> float:
    if not shutil.which("cppcheck"):
        return 0.55
    if repo.get("size", 99999) > _SIZE_LIMIT_KB:
        return 0.55
    clone_url = f"https://{settings.GITHUB_TOKEN}@github.com/{username}/{repo['name']}.git"
    with tempfile.TemporaryDirectory() as tmpdir:
        try:
            import git
            git.Repo.clone_from(clone_url, tmpdir, depth=1)

            result = subprocess.run(
                ["cppcheck", "--enable=complexity", "--xml", tmpdir],
                capture_output=True, text=True, timeout=60,
            )
            try:
                # cppcheck writes its XML report to stderr
                root = ET.fromstring(result.stderr)
                issues = len(root.findall(".//error"))
            except Exception:
                return 0.55

            c_files = _count_files(tmpdir, ".c") + _count_files(tmpdir, ".cpp")
            score = _ratio_score(issues, max(c_files, 1), 3.0)
            logger.debug(
                "C/C++ cppcheck %s/%s: %d issues / %d files → %.3f",
                username, repo["name"], issues, c_files, score,
            )
            return score
        except Exception as exc:
            logger.debug("C/C++ cppcheck failed for %s/%s: %s", username, repo["name"], exc)
            return 0.55


def _other_lang_heuristic(repos: list) -> float:
    """
    Heuristic score for languages without a static analyser.
    Avoids penalising developers who use non-mainstream languages while not
    over-rewarding them relative to analysed candidates.
    """
    avg_stars = sum(r.get("stargazers_count", 0) for r in repos) / max(len(repos), 1)

    has_ci = any(_CI_TOPICS & set(r.get("topics", [])) for r in repos)

    def _activity(repo: dict) -> float:
        try:
            pushed = datetime.fromisoformat(repo["pushed_at"].replace("Z", "+00:00"))
            created = datetime.fromisoformat(repo["created_at"].replace("Z", "+00:00"))
            months = max((pushed - created).days / 30.0, 1.0)
            return repo.get("size", 0) / months  # size-per-month as activity proxy
        except Exception:
            return 0.0

    avg_activity = sum(_activity(r) for r in repos) / max(len(repos), 1)

    score = 0.4
    if avg_stars > 5:
        score += 0.1
    if has_ci:
        score += 0.1
    if avg_activity > 10:
        score += 0.1
    return min(score, 0.7)


# ---------------------------------------------------------------------------
# Radon output parsers (unchanged)
# ---------------------------------------------------------------------------

def _parse_radon_cc(output: str) -> Optional[float]:
    match = re.search(r"Average complexity: \w+ \(([0-9.]+)\)", output)
    return float(match.group(1)) if match else None


def _parse_radon_hal(output: str) -> Optional[float]:
    volumes = [float(m) for m in re.findall(r'"volume":\s*([0-9.]+)', output)]
    return sum(volumes) if volumes else None
