import json
from typing import Optional
from app.services.llm_utils import call_llm_json


_sbert_model = None


def get_sbert_model():
    global _sbert_model
    if _sbert_model is None:
        from sentence_transformers import SentenceTransformer
        # Force CPU: MPS cannot be re-initialised inside a forked Celery worker on macOS
        _sbert_model = SentenceTransformer("all-MiniLM-L6-v2", device="cpu")
    return _sbert_model


def cosine_similarity(a, b) -> float:
    import numpy as np
    a, b = np.array(a), np.array(b)
    denom = (np.linalg.norm(a) * np.linalg.norm(b))
    if denom == 0:
        return 0.0
    return float(np.dot(a, b) / denom)


async def analyse_resume(resume_text: str, job_description: str) -> dict:
    system_prompt = (
        "You are an expert resume parser. Extract structured information from the resume "
        "and return ONLY valid JSON with these exact keys: "
        "skills (list of strings), education (list of {institution, degree, year}), "
        "experience (list of {company, role, duration, description}), "
        "certifications (list of strings), summary (2-3 sentence profile summary)"
    )
    user_prompt = f"Resume:\n{resume_text}"

    extracted = await call_llm_json(system_prompt, user_prompt)

    model = get_sbert_model()
    candidate_text = " ".join([
        " ".join(extracted.get("skills", [])),
        " ".join(
            f"{e.get('institution','')} {e.get('degree','')}"
            for e in extracted.get("education", [])
        ),
        " ".join(
            f"{e.get('company','')} {e.get('role','')} {e.get('description','')}"
            for e in extracted.get("experience", [])
        ),
        " ".join(extracted.get("certifications", [])),
        extracted.get("summary", ""),
    ])

    candidate_embedding = model.encode(candidate_text)
    jd_embedding = model.encode(job_description)
    similarity = cosine_similarity(candidate_embedding, jd_embedding)
    similarity = max(0.0, min(1.0, similarity))

    return {
        "score": similarity,
        "details": {
            "extracted_skills": extracted.get("skills", []),
            "education": extracted.get("education", []),
            "experience": extracted.get("experience", []),
            "certifications": extracted.get("certifications", []),
            "semantic_similarity": similarity,
            "llm_summary": extracted.get("summary", ""),
        },
    }
