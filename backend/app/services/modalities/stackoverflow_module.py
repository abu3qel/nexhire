import re
import math
from typing import Optional
import httpx
from app.config import settings

SO_BASE = "https://api.stackexchange.com/2.3"


async def analyse_stackoverflow(so_url: Optional[str], job_description: str) -> Optional[dict]:
    if not so_url:
        return None

    user_id = _extract_user_id(so_url)
    if not user_id:
        return None

    params_base = {"site": "stackoverflow", "key": settings.STACK_EXCHANGE_KEY}

    async with httpx.AsyncClient(timeout=20.0) as client:
        try:
            user_resp = await client.get(f"{SO_BASE}/users/{user_id}", params=params_base)
            user_resp.raise_for_status()
            user_items = user_resp.json().get("items", [])
            if not user_items:
                return None
            user_data = user_items[0]
        except Exception:
            return None

        reputation = user_data.get("reputation", 0)
        badge_counts = user_data.get("badge_counts", {"gold": 0, "silver": 0, "bronze": 0})

        try:
            ans_resp = await client.get(
                f"{SO_BASE}/users/{user_id}/answers",
                params={**params_base, "order": "desc", "sort": "votes", "pagesize": 50},
            )
            answers = ans_resp.json().get("items", []) if ans_resp.status_code == 200 else []
        except Exception:
            answers = []

        answer_count = len(answers)
        accepted_count = sum(1 for a in answers if a.get("is_accepted"))

        try:
            tags_resp = await client.get(
                f"{SO_BASE}/users/{user_id}/tags",
                params={**params_base, "order": "desc", "sort": "activity", "pagesize": 10},
            )
            tags = [t["name"] for t in tags_resp.json().get("items", [])] if tags_resp.status_code == 200 else []
        except Exception:
            tags = []

    reputation_score = min(1.0, math.log10(reputation + 1) / math.log10(100000))
    acceptance_rate = accepted_count / answer_count if answer_count > 0 else 0.0
    badge_score = min(1.0, (badge_counts.get("gold", 0) * 3 + badge_counts.get("silver", 0) * 2 + badge_counts.get("bronze", 0)) / 100)
    tag_diversity = len(tags) / 10

    so_score = (
        0.4 * reputation_score
        + 0.3 * acceptance_rate
        + 0.2 * badge_score
        + 0.1 * tag_diversity
    )

    return {
        "score": so_score,
        "details": {
            "reputation": reputation,
            "top_tags": tags,
            "answer_count": answer_count,
            "acceptance_rate": acceptance_rate,
            "badge_counts": badge_counts,
        },
    }


def _extract_user_id(url: str) -> Optional[str]:
    match = re.search(r"/users/(\d+)", url)
    return match.group(1) if match else None
