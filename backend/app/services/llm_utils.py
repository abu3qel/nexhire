import json
import asyncio
from openai import AsyncOpenAI
from tenacity import retry, stop_after_attempt, wait_exponential
from app.config import settings

_client = None


def get_client() -> AsyncOpenAI:
    global _client
    if _client is None:
        _client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
    return _client


@retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10))
async def call_llm_json(system_prompt: str, user_prompt: str, model: str = "gpt-4o-mini") -> dict:
    client = get_client()
    response = await client.chat.completions.create(
        model=model,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        response_format={"type": "json_object"},
        temperature=0.1,
    )
    content = response.choices[0].message.content or "{}"
    try:
        return json.loads(content)
    except json.JSONDecodeError:
        # Retry with explicit JSON instruction
        retry_response = await client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": system_prompt + "\n\nIMPORTANT: Return ONLY valid JSON, nothing else."},
                {"role": "user", "content": user_prompt},
            ],
            response_format={"type": "json_object"},
            temperature=0.0,
        )
        return json.loads(retry_response.choices[0].message.content or "{}")


@retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10))
async def call_llm_text(
    system_prompt: str,
    messages: list[dict],
    model: str = "gpt-4o-mini",
) -> str:
    client = get_client()
    all_messages = [{"role": "system", "content": system_prompt}] + messages
    response = await client.chat.completions.create(
        model=model,
        messages=all_messages,
        temperature=0.3,
    )
    return response.choices[0].message.content or ""


async def embed_text(text: str) -> list[float]:
    client = get_client()
    response = await client.embeddings.create(
        model="text-embedding-3-small",
        input=text,
    )
    return response.data[0].embedding
