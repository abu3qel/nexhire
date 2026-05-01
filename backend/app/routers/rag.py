from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.user import User
from app.schemas.assessment import RAGChatRequest, RAGChatResponse
from app.routers.auth import require_recruiter
from app.services.rag_service import query_rag

router = APIRouter(prefix="/rag", tags=["rag"])


@router.post("/chat", response_model=RAGChatResponse)
async def chat(
    body: RAGChatRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_recruiter),
):
    try:
        answer, sources, retrieval_confidence = await query_rag(
            db=db,
            application_id=str(body.application_id),
            message=body.message,
            conversation_history=body.conversation_history,
        )
        return RAGChatResponse(answer=answer, sources=sources, retrieval_confidence=retrieval_confidence)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
