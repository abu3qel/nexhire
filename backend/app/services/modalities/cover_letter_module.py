from typing import Optional
from app.services.llm_utils import call_llm_json


async def analyse_cover_letter(cover_letter_text: Optional[str], job_description: str) -> Optional[dict]:
    if not cover_letter_text or not cover_letter_text.strip():
        return None

    system_prompt = (
        "You are an expert recruiter evaluating a cover letter for a technical role. "
        "Score the cover letter on three dimensions and return ONLY valid JSON: "
        "clarity_score (0.0-1.0): how clearly and professionally the candidate writes, "
        "motivation_score (0.0-1.0): how genuinely motivated and role-specific the letter is, "
        "relevance_score (0.0-1.0): how relevant the candidate's stated experience is to the JD, "
        "feedback (string): 2-3 sentence constructive summary"
    )
    user_prompt = f"Job Description:\n{job_description}\n\nCover Letter:\n{cover_letter_text}"

    result = await call_llm_json(system_prompt, user_prompt)

    clarity = float(result.get("clarity_score", 0.5))
    motivation = float(result.get("motivation_score", 0.5))
    relevance = float(result.get("relevance_score", 0.5))

    clarity = max(0.0, min(1.0, clarity))
    motivation = max(0.0, min(1.0, motivation))
    relevance = max(0.0, min(1.0, relevance))

    score = (clarity + motivation + relevance) / 3.0

    return {
        "score": score,
        "details": {
            "clarity_score": clarity,
            "motivation_score": motivation,
            "relevance_score": relevance,
            "llm_feedback": result.get("feedback", ""),
        },
    }
