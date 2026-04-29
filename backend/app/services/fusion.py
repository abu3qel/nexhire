from typing import Optional


def compute_composite_score(
    scores: dict[str, Optional[float]],
    weights: dict[str, float],
) -> float:
    """
    Weighted late fusion. Re-normalises weights across available modalities.
    scores: {"resume": 0.82, "cover_letter": None, "github": 0.71, ...}
    weights: {"resume": 0.35, "cover_letter": 0.15, ...}
    """
    available = {m: s for m, s in scores.items() if s is not None}
    if not available:
        return 0.0

    total_weight = sum(weights.get(m, 0.0) for m in available)
    if total_weight == 0.0:
        return sum(available.values()) / len(available)

    composite = sum(weights.get(m, 0.0) * s / total_weight for m, s in available.items())
    return max(0.0, min(1.0, composite))


def compute_baseline_score(resume_score: Optional[float]) -> float:
    return resume_score or 0.0
