import math
from typing import Optional


def compute_confidence_scores(
    scores: dict[str, Optional[float]],
    modality_details: dict,
) -> dict[str, float]:
    """
    Per-modality confidence in [0, 1] based on data richness.
    Only modalities with non-None scores are included.
    """
    confidence: dict[str, float] = {}

    if scores.get("resume") is not None:
        rd = modality_details.get("resume") or {}
        skill_count = len(rd.get("extracted_skills", []))
        exp_count = len(rd.get("experience", []))
        # More extracted content = more signal to be confident about
        confidence["resume"] = min(0.5 + (skill_count / 20.0) * 0.3 + (exp_count / 5.0) * 0.2, 1.0)

    if scores.get("cover_letter") is not None:
        cd = modality_details.get("cover_letter") or {}
        # Clarity score is a proxy for coherence of the letter
        clarity = cd.get("clarity_score", 0.5)
        confidence["cover_letter"] = max(clarity, 0.2)

    if scores.get("github") is not None:
        gd = modality_details.get("github") or {}
        repo_count = gd.get("repo_count", 0)
        total_commits = gd.get("total_commits", 0)
        repo_factor = min(repo_count / 8.0, 1.0)
        commit_factor = min(total_commits / 80.0, 1.0)
        raw = repo_factor * 0.5 + commit_factor * 0.5
        # Ensure minimum 0.2 if we could reach the profile at all
        confidence["github"] = max(raw, 0.2)

    if scores.get("stackoverflow") is not None:
        sd = modality_details.get("stackoverflow") or {}
        rep = sd.get("reputation", 0)
        # log scale: rep=1 → ~0.0, rep=100 → 0.4, rep=10000 → 0.8
        confidence["stackoverflow"] = min(math.log10(rep + 10) / 5.0, 1.0)

    if scores.get("portfolio") is not None:
        pd = modality_details.get("portfolio") or {}
        proj_factor = min(pd.get("projects_found", 0) / 3.0, 1.0)
        tech_factor = min(len(pd.get("technologies", [])) / 5.0, 1.0)
        raw = proj_factor * 0.6 + tech_factor * 0.4
        confidence["portfolio"] = max(raw, 0.2)

    return confidence


def compute_composite_score(
    scores: dict[str, Optional[float]],
    weights: dict[str, float],
    confidence_scores: dict[str, float] | None = None,
) -> tuple[float, dict[str, float]]:
    """
    Confidence-weighted late fusion.
    effective_weight[m] = base_weight[m] * confidence[m]
    Re-normalises across available modalities.
    Returns (composite_score, effective_weights_used).
    """
    available = {m: s for m, s in scores.items() if s is not None}
    if not available:
        return 0.0, {}

    effective_weights: dict[str, float] = {}
    for m in available:
        base_w = weights.get(m, 0.0)
        conf = (confidence_scores or {}).get(m, 1.0)
        effective_weights[m] = base_w * conf

    total_weight = sum(effective_weights.values())
    if total_weight == 0.0:
        uniform = 1.0 / len(available)
        effective_weights = {m: uniform for m in available}
        total_weight = 1.0

    composite = sum(effective_weights[m] * s / total_weight for m, s in available.items())
    return max(0.0, min(1.0, composite)), effective_weights


def compute_baseline_score(resume_score: Optional[float]) -> float:
    return resume_score or 0.0


def build_explanation(
    scores: dict[str, Optional[float]],
    effective_weights: dict[str, float],
    confidence_scores: dict[str, float],
    composite: float,
    baseline: float,
) -> dict:
    """Build a structured, human-readable explanation of the composite score."""
    available = {m: s for m, s in scores.items() if s is not None}
    total_w = sum(effective_weights.values()) or 1.0

    contributions: dict[str, dict] = {}
    for m, s in available.items():
        w = effective_weights.get(m, 0.0)
        contributions[m] = {
            "score": round(s, 3),
            "effective_weight_pct": round((w / total_w) * 100, 1),
            "confidence": round(confidence_scores.get(m, 1.0), 3),
            "contribution": round((w / total_w) * s, 3),
        }

    ranked = sorted(contributions, key=lambda m: contributions[m]["contribution"], reverse=True)
    primary_driver = ranked[0] if ranked else None
    secondary_driver = ranked[1] if len(ranked) > 1 else None

    avg_conf = sum(confidence_scores.values()) / len(confidence_scores) if confidence_scores else 1.0
    if avg_conf >= 0.7:
        confidence_note = "High confidence: rich data across modalities"
    elif avg_conf >= 0.4:
        confidence_note = "Moderate confidence: some signals have limited data"
    else:
        confidence_note = "Low confidence: limited data available for most modalities"

    delta = composite - baseline

    # Find modalities where high weight was undermined by low confidence
    low_conf_warnings = [
        m for m, c in contributions.items()
        if c["effective_weight_pct"] >= 15 and confidence_scores.get(m, 1.0) < 0.4
    ]

    if primary_driver:
        driver_score = round(contributions[primary_driver]["score"] * 100)
        driver_label = primary_driver.replace("_", " ").title()
        parts = [
            f"Composite score of {round(composite * 100)}/100, "
            f"led by {driver_label} ({driver_score}/100, "
            f"{contributions[primary_driver]['effective_weight_pct']:.0f}% effective weight)"
        ]

        if secondary_driver:
            sec_score = round(contributions[secondary_driver]["score"] * 100)
            sec_label = secondary_driver.replace("_", " ").title()
            parts.append(
                f"with {sec_label} as second contributor ({sec_score}/100)"
            )

        if delta > 0.04:
            parts.append(
                f"multi-modal signals lifted this candidate "
                f"{round(delta * 100)} pts above the resume-only baseline"
            )
        elif delta < -0.04:
            parts.append(
                f"additional signals pulled {round(-delta * 100)} pts below "
                f"the resume-only baseline"
            )

        if low_conf_warnings:
            labels = " and ".join(m.replace("_", " ").title() for m in low_conf_warnings)
            parts.append(
                f"note: {labels} had low confidence due to limited data, "
                f"reducing its influence on the final score"
            )

        summary = "; ".join(parts) + "."
    else:
        summary = "Insufficient data to compute a composite score."

    return {
        "summary": summary,
        "modality_contributions": contributions,
        "primary_driver": primary_driver,
        "modalities_available": len(available),
        "confidence_note": confidence_note,
        "avg_confidence": round(avg_conf, 3),
        "fusion_delta_vs_baseline": round(delta, 3),
    }
