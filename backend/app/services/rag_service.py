from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import delete, text
from app.models.assessment import CandidateChunk
from app.services.llm_utils import embed_text, call_llm_text


def _chunk_text(text: str, size: int = 500, overlap: int = 50) -> list[str]:
    if not text:
        return []
    chunks = []
    start = 0
    while start < len(text):
        end = start + size
        chunks.append(text[start:end])
        start += size - overlap
    return chunks


async def ingest_candidate_chunks(
    db: AsyncSession,
    application_id: str,
    resume_text: str,
    cover_letter_text: str | None,
    github_data: dict | None,
    portfolio_data: dict | None,
    assessment_data: dict,
    candidate_name: str,
) -> None:
    # Remove old chunks for idempotency
    await db.execute(delete(CandidateChunk).where(CandidateChunk.application_id == application_id))
    await db.flush()

    chunks_to_add: list[tuple[str, str]] = []

    # 1. Resume chunks
    for chunk in _chunk_text(resume_text):
        chunks_to_add.append((chunk, "resume"))

    # 2. Cover letter
    if cover_letter_text:
        for chunk in _chunk_text(cover_letter_text):
            chunks_to_add.append((chunk, "cover_letter"))

    # 3. Score summary
    score_summary = _build_score_summary(assessment_data)
    chunks_to_add.append((score_summary, "scores"))

    # 4. GitHub READMEs
    if github_data and github_data.get("readme_texts"):
        for readme in github_data["readme_texts"]:
            for chunk in _chunk_text(readme):
                chunks_to_add.append((chunk, "github_readme"))

    # 5. Portfolio scraped text
    if portfolio_data and portfolio_data.get("scraped_text"):
        for chunk in _chunk_text(portfolio_data["scraped_text"]):
            chunks_to_add.append((chunk, "portfolio"))

    # 6. Profile summary
    details = assessment_data.get("resume_details") or {}
    edu_parts = ["{} at {}".format(e.get("degree", ""), e.get("institution", "")) for e in details.get("education", [])]
    exp_parts = ["{} at {}".format(e.get("role", ""), e.get("company", "")) for e in details.get("experience", [])]
    profile_summary = (
        "Candidate: {}. Skills: {}. Education: {}. Experience: {}. Certifications: {}.".format(
            candidate_name,
            ", ".join(details.get("extracted_skills", [])),
            "; ".join(edu_parts),
            "; ".join(exp_parts),
            ", ".join(details.get("certifications", [])),
        )
    )
    chunks_to_add.append((profile_summary, "profile_summary"))

    # Embed and persist
    for chunk_text, source in chunks_to_add:
        if not chunk_text.strip():
            continue
        try:
            embedding = await embed_text(chunk_text)
        except Exception:
            embedding = None

        db.add(CandidateChunk(
            application_id=application_id,
            chunk_text=chunk_text,
            chunk_source=source,
            embedding=embedding,
        ))

    await db.commit()


def _build_score_summary(data: dict) -> str:
    parts = []
    if data.get("resume_score") is not None:
        rd = data.get("resume_details") or {}
        skills = ", ".join(rd.get("extracted_skills", [])[:8])
        parts.append(f"Resume Score: {data['resume_score']:.2f} | Skills: {skills}")

    if data.get("cover_letter_score") is not None:
        parts.append(f"Cover Letter Score: {data['cover_letter_score']:.2f}")

    if data.get("github_score") is not None:
        gd = data.get("github_details") or {}
        parts.append(
            f"GitHub Score: {data['github_score']:.2f} | "
            f"Repos: {gd.get('repo_count', '?')}, Commits: {gd.get('total_commits', '?')}"
        )

    if data.get("stackoverflow_score") is not None:
        sd = data.get("stackoverflow_details") or {}
        parts.append(
            f"Stack Overflow Score: {data['stackoverflow_score']:.2f} | "
            f"Reputation: {sd.get('reputation', '?')}"
        )

    if data.get("portfolio_score") is not None:
        parts.append(f"Portfolio Score: {data['portfolio_score']:.2f}")

    if data.get("composite_score") is not None:
        parts.append(f"Composite Score: {data['composite_score']:.2f}")

    return " | ".join(parts)


async def query_rag(
    db: AsyncSession,
    application_id: str,
    message: str,
    conversation_history: list[dict],
) -> tuple[str, list[str], float]:
    query_embedding = await embed_text(message)

    result = await db.execute(
        text("""
            SELECT chunk_text, chunk_source,
                   1 - (embedding <=> CAST(:embedding AS vector)) AS similarity
            FROM candidate_chunks
            WHERE application_id = :app_id
              AND embedding IS NOT NULL
            ORDER BY embedding <=> CAST(:embedding AS vector)
            LIMIT 6
        """),
        {"embedding": str(query_embedding), "app_id": application_id},
    )
    rows = result.fetchall()

    if not rows:
        return "No candidate data available for this application.", [], 0.0

    context_parts = []
    sources = []
    similarities = []
    for row in rows:
        context_parts.append(f"[{row.chunk_source}]: {row.chunk_text}")
        if row.chunk_source not in sources:
            sources.append(row.chunk_source)
        similarities.append(float(row.similarity))

    retrieval_confidence = sum(similarities) / len(similarities)
    context = "\n\n".join(context_parts)

    system_prompt = (
        "You are a recruitment assistant helping a recruiter evaluate a candidate. "
        "Answer questions about this candidate based ONLY on the provided context. "
        "Be specific, cite scores and data where relevant. If information is not "
        "in the context, say so clearly.\n\n"
        f"Context:\n{context}"
    )

    messages = []
    for turn in conversation_history[-6:]:
        messages.append({"role": turn["role"], "content": turn["content"]})
    messages.append({"role": "user", "content": message})

    answer = await call_llm_text(system_prompt, messages)
    return answer, sources, round(retrieval_confidence, 3)
