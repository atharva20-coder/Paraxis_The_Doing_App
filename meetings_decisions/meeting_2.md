# ⚡ SPARK — Agent Council Meeting #2 (Emergency Session)

**Date**: 26 Feb 2026 · 16:36 IST  
**Trigger**: New architectural direction proposed via external Gemini consultation  
**Agenda**: Python backend, Open-source LLMs, Agent orchestration, Vector DB, Prompt Engineering  
**Attendees**: 🎯 Pichai (TPM) · 🏗️ Ive-Infra (Architect) · 💻 Dev (Developer) · 🎨 Jony (Designer)

---

## Opening: Orchestrator Sets Context

**🎯 Pichai**: _Emergency session. We have significant new input from an external technical consultation. The core proposals are:_

1. \*Switch the backend from Next.js 15 to **Python (FastAPI)\***
2. _Use **open-source LLMs** (Llama via Ollama/HuggingFace) instead of paid OpenRouter APIs_
3. _Use **LangChain/CrewAI** for multi-agent orchestration_
4. _Add **Celery + Redis** for background processing instead of Inngest_
5. _Introduce a **Vector Database** (Pinecone/Weaviate) for agent context memory_
6. \*Two new prompt engineering concepts: **Opinionated PM Agent** and **Dynamic Task Chunking\***

_Every one of these challenges a decision from Meeting #1. I want each of you to weigh in from your domain. We resolve everything today._

---

## Agenda Item 1: Python (FastAPI) vs Next.js 15

**🎯 Pichai**: _The Gemini consultation explicitly recommends Python FastAPI. Our Global Rules mandate Next.js 15. This is the biggest fork. Architect, give me the honest assessment._

**🏗️ Ive-Infra (Architect)**: _Here is my honest view — Python wins for this specific product._

_SPARK is an **AI-agentic app**. 90% of the backend work is calling LLMs, parsing search results, and orchestrating multi-step AI pipelines. The Python ecosystem dominates this space:_

- _Every LLM SDK (OpenAI, Google GenAI, Anthropic, Ollama) has Python as the first-class client._
- _Scientific libraries (numpy, pandas) are available if we need structured data analysis in agents._
- _FastAPI gives us native async/await, automatic OpenAPI docs, and Pydantic for validation — Pydantic IS the Python equivalent of Zod. Same schema-first, strict-validation philosophy._
- _Python is where Ollama, HuggingFace, and the entire open-source AI ecosystem lives natively._

_Next.js 15 is exceptional for SSR web apps and typed REST APIs in a web-first product. But forcing AI agent orchestration through TypeScript when the entire toolchain is Python-native is fighting the ecosystem._

**💻 Dev (Developer)**: _I agree with the Architect. But I want to preserve one thing: the **Gateway Pattern** must survive the switch. FastAPI supports this perfectly:_

```python
# The Gateway Pattern — Python Edition
@router.post("/ideas", status_code=201)
async def create_idea(
    body: IdeaCreateSchema,             # Pydantic validates automatically (= Zod)
    user: AuthenticatedUser = Depends(get_current_user),  # Auth middleware
):
    # Pure service call — no business logic in the route
    result = await idea_service.create(user_id=user.id, data=body)
    return result
```

_Pydantic handles the `undefined → None` normalization natively. Optional fields default to `None` unless explicitly set. We get the Zero-Patchwork behavior for free._

**🎨 Jony (Designer)**: _I have no objection as long as the API response times to the mobile app remain under 200ms for reads. The backend language is invisible to the user._

**🎯 Pichai**: _What about the Next.js Global Rules?_

**🏗️ Ive-Infra**: _We adapt them. The **principles** of the Global Rules survive perfectly in Python:_

| Global Rule                                      | Next.js Implementation      | Python (FastAPI) Equivalent         |
| ------------------------------------------------ | --------------------------- | ----------------------------------- |
| Schema-first validation                          | Zod                         | **Pydantic v2**                     |
| Gateway pattern (Auth→Validate→Service→Response) | `route.ts`                  | **FastAPI route + Depends()**       |
| Service layer purity                             | `src/services/*.service.ts` | `app/services/*.py`                 |
| IDOR protection                                  | Prisma compound `where`     | **SQLAlchemy compound filter**      |
| Rate limiting                                    | Upstash Redis               | **Upstash Redis (same)**            |
| Strict typing                                    | TypeScript strict           | **Python type hints + mypy strict** |

> ### ✅ DECISION 1: Backend Pivot to Python
>
> - **API Framework**: FastAPI (Python 3.12+)
> - **Validation**: Pydantic v2 (schema-first, strict mode)
> - **ORM**: SQLAlchemy 2.0 (async) + Alembic for migrations
> - **Deployment**: Railway / Render / Fly.io (free tiers available)
> - **Next.js**: Reserved ONLY for an optional web landing page / admin dashboard (Phase 2)
> - **All Global Rules** (Gateway Pattern, Service Layer, IDOR, Rate Limiting) carry over via Python equivalents

---

## Agenda Item 2: Open-Source LLMs (Ollama/Llama) vs Paid APIs

**🎯 Pichai**: _The consultation suggests using Ollama and HuggingFace models. This could bring our AI costs to near-zero. But I need the Architect to tell me the real infrastructure cost._

**🏗️ Ive-Infra (Architect)**: _Let me be brutally honest about the tradeoffs:_

| Approach                             | Dev Cost            | Production Cost                 | Latency      | Quality                    |
| ------------------------------------ | ------------------- | ------------------------------- | ------------ | -------------------------- |
| **Ollama (self-hosted)**             | ₹0 (runs on laptop) | ₹3,000–₹8,000/mo (GPU instance) | 2–8 sec      | Good (Llama 3.1 8B)        |
| **Groq (hosted open-source)**        | Free tier available | ₹0–₹500/mo at 1K MAU            | 0.3–1 sec ⚡ | Good (Llama 3.1 70B)       |
| **Together.ai (hosted open-source)** | Free tier available | ₹200–₹800/mo at 1K MAU          | 1–3 sec      | Great (Llama 3.1 70B/405B) |
| **Gemini Flash (OpenRouter)**        | Pay-per-token       | ₹150/mo at 1K MAU               | 1–2 sec      | Great                      |

_My recommendation: a **tiered LLM strategy**:_

```
TIER 1 (Default — Cheapest):
  → Groq API (free tier: 14.4K tokens/min of Llama 3.1 70B)
  → Used for: Research query generation, task atomization, scheduling logic

TIER 2 (Complex synthesis):
  → Together.ai (Llama 3.1 70B or Qwen 2.5 72B)
  → Used for: Full research synthesis, Enhancement Agent

TIER 3 (Streaming / Fallback):
  → Gemini 2.0 Flash (via Google AI SDK — free tier: 15 RPM)
  → Used for: Dig-Deeper streaming, fallback if Tier 1+2 fail

LOCAL DEV:
  → Ollama running Llama 3.2 3B on developer's MacBook
  → Zero cost during development. Test prompts locally before deploying.
```

**💻 Dev (Developer)**: _I love this. I'll build a unified `LLMClient` abstraction that takes a tier parameter:_

```python
class LLMClient:
    async def generate(self, prompt: str, tier: Literal["fast", "smart", "stream"] = "fast") -> str:
        # tier="fast"   → Groq (Llama 3.1 70B)
        # tier="smart"  → Together.ai (Llama 3.1 70B)
        # tier="stream" → Gemini Flash (SSE)
        # Automatic fallback chain if primary fails
```

_This means we can swap models by changing one enum value. No vendor lock-in. And the Redis cache sits in front of ALL tiers — identical prompts never hit any LLM twice._

**🎯 Pichai**: _What's the revised cost projection at 1,000 MAU?_

**🏗️ Ive-Infra**:

| Resource                          | Usage         | Monthly Cost             |
| --------------------------------- | ------------- | ------------------------ |
| Groq (Llama 3.1 70B)              | ~70% of calls | ₹0 (free tier covers it) |
| Together.ai (complex synthesis)   | ~25% of calls | ₹400                     |
| Gemini Flash (streaming fallback) | ~5% of calls  | ₹50                      |
| Tavily Search                     | ~2,100 calls  | ₹2,900                   |
| **Total**                         |               | **~₹3,350/month**        |

_Nearly identical to Meeting #1, but now 70% of LLM calls are completely free via Groq. And we can switch to self-hosted Ollama on a GPU server later for even more savings at scale._

> ### ✅ DECISION 2: Tiered Open-Source LLM Strategy
>
> - **Local Dev**: Ollama + Llama 3.2 3B (₹0)
> - **Production Tier 1**: Groq API — Llama 3.1 70B (free tier, ultra-fast)
> - **Production Tier 2**: Together.ai — Llama 3.1 70B (complex synthesis, ~₹400/mo)
> - **Production Tier 3**: Gemini 2.0 Flash (streaming + fallback)
> - **Unified `LLMClient`** abstraction with automatic fallback chain
> - **Redis cache** in front of all tiers — cache key = SHA-256(normalized_prompt)

---

## Agenda Item 3: LangChain / CrewAI vs Simple Async Functions

**🎯 Pichai**: _The Gemini chat recommends LangChain or CrewAI for multi-agent orchestration. Our Meeting #1 explicitly forbade complex frameworks. Developer, Architect — fight it out._

**🏗️ Ive-Infra (Architect)**: _My ruling from Meeting #1 stands — **no LangChain, no CrewAI for v1**. Here's why:_

1. _Our agents are **sequential pipelines**, not autonomous decision-makers. The Research Agent doesn't "decide" what to do next — it follows a fixed 3-step pipeline: generate queries → search → synthesize._
2. _LangChain adds ~50MB of dependencies, has frequent breaking API changes, and introduces abstraction layers that make debugging LLM calls nearly impossible._
3. _CrewAI is lighter but still overkill for 4 agents that are essentially `async def research(idea: str) -> ResearchResult`._

**💻 Dev (Developer)**: _Agreed. Here's what our agents look like as simple Python functions:_

```python
# app/agents/research_agent.py
async def run_research(idea_id: str, idea_text: str) -> ResearchResult:
    """Simple. Boring. Debuggable."""
    # Step 1: Generate search queries
    queries = await llm_client.generate(
        prompt=QUERY_GENERATION_PROMPT.format(idea=idea_text),
        tier="fast",
        response_format=QueryListSchema,  # Pydantic model
    )

    # Step 2: Execute web searches in parallel
    search_results = await asyncio.gather(
        *[tavily_client.search(q) for q in queries.queries]
    )

    # Step 3: Synthesize into structured output
    synthesis = await llm_client.generate(
        prompt=SYNTHESIS_PROMPT.format(idea=idea_text, results=search_results),
        tier="smart",
        response_format=ResearchResultSchema,
    )

    # Step 4: Persist + notify
    await research_service.save(idea_id, synthesis)
    await push_notification(idea_id, "Your SPARK is ready")

    return synthesis
```

_No framework. No chains. No agents-calling-agents. Just `async/await` and Pydantic schemas. If this ever becomes too complex, we add LangGraph or CrewAI in Phase 2 — but I doubt it will._

> ### ✅ DECISION 3: No Agent Frameworks for v1
>
> - **Agents are simple async Python functions** with Pydantic input/output schemas
> - **No LangChain, no CrewAI, no AutoGen** — zero framework overhead
> - **Revisit in Phase 2** only if agent complexity genuinely demands it (e.g., agents need to dynamically choose tools)
> - **Rationale**: You can always add complexity. You cannot remove it.

---

## Agenda Item 4: Background Processing — Celery + Redis vs Inngest

**🎯 Pichai**: _With the Python pivot, Inngest no longer fits natively. The Gemini chat suggests Celery + Redis. Architect?_

**🏗️ Ive-Infra (Architect)**: _Celery is the industry standard for Python async task queues, but it's heavyweight. For a ₹0 budget startup, I propose a lighter alternative:_

| Option                      | Complexity                              | Cost                 | Python Native |
| --------------------------- | --------------------------------------- | -------------------- | ------------- |
| **Celery + Redis**          | High (broker config, worker management) | Upstash Redis (free) | ✅            |
| **ARQ (async Redis queue)** | Low (pure async, minimal config)        | Upstash Redis (free) | ✅            |
| **Dramatiq + Redis**        | Medium                                  | Upstash Redis (free) | ✅            |

_My recommendation: **ARQ**. It's a lightweight async task queue built on Redis + asyncio. Perfect for our use case — no need for Celery's full distributed task infrastructure when we have 4 simple agent functions._

**💻 Dev (Developer)**: _ARQ is perfect. Here's how clean the integration is:_

```python
# app/workers.py
from arq import create_pool
from app.agents.research_agent import run_research

async def startup(ctx):
    ctx["db"] = await get_db_session()

async def research_task(ctx, idea_id: str, idea_text: str):
    await run_research(idea_id, idea_text)

class WorkerSettings:
    functions = [research_task]
    on_startup = startup
    redis_settings = RedisSettings.from_dsn(UPSTASH_REDIS_URL)
```

_If we outgrow ARQ, migrating to Celery is trivial because the task function signatures stay the same._

> ### ✅ DECISION 4: ARQ (Lightweight Redis Task Queue)
>
> - **Task Queue**: ARQ (pure Python async, Redis-backed)
> - **Broker**: Upstash Redis (free tier, same as caching layer)
> - **Upgrade Path**: Migrate to Celery only if we need multi-worker distributed processing at 100K+ MAU
> - **Cron Jobs** (Rescue Agent, Enhancement Agent triggers): ARQ's built-in cron support

---

## Agenda Item 5: Vector Database & Context Memory

**🎯 Pichai**: _Pinecone and Weaviate were suggested for agent context memory. Do we need this for v1?_

**🏗️ Ive-Infra (Architect)**: _No. Here's the analysis:_

_The only use case for vector search in v1 is the **Enhancement Agent** (40% completion trigger) and the **Idea Collision** feature. Both need to "remember" past ideas and find semantic similarities._

_But for v1, we have at most 10 ideas per user. A simple SQL query with keyword matching or even re-reading all 10 ideas into the LLM context window is functionally equivalent to a vector search at this scale._

_When we DO need vector search (Phase 2, at 1,000+ users with 30+ ideas each), we use **pgvector** — a PostgreSQL extension. It runs inside the same database. No separate service. No new infrastructure. No new bill._

```sql
-- Phase 2: Add to existing PostgreSQL via Alembic migration
CREATE EXTENSION IF NOT EXISTS vector;
ALTER TABLE ideas ADD COLUMN embedding vector(384);
-- Query: Find similar ideas
SELECT * FROM ideas
WHERE user_id = $1
ORDER BY embedding <=> $2
LIMIT 5;
```

> ### ✅ DECISION 5: No Vector DB for v1
>
> - **v1**: Agent context = re-read from PostgreSQL (works at <50 ideas/user)
> - **Phase 2**: Add **pgvector** extension to existing PostgreSQL (zero new infrastructure)
> - **Skip**: Pinecone, Weaviate, ChromaDB — unnecessary cost and complexity for v1

---

## Agenda Item 6: The "Opinionated PM Agent" & Dynamic Task Chunking

**🎯 Pichai**: _The Gemini consultation introduced two brilliant prompt engineering concepts. These are not infrastructure decisions — they're product intelligence. I want them adopted immediately._

### 6A. The Opinionated PM Agent

**🏗️ Ive-Infra**: _The Research Agent must not act like a confused intern presenting 5 options. It must act like a senior startup CTO who has already decided._

**Core System Prompt Directive:**

```
You are an opinionated MVP architect. Your job is to pick ONE path —
the fastest, most proven, lowest-friction approach to build this idea.

RULES:
- Never present multiple options. DECIDE.
- Always prefer: managed services > self-hosted, popular frameworks > niche ones
- Prioritize approaches with "quickstart" guides and large communities
- Every step must be completable by a solo developer in one sitting
- If the idea is a web app: default to Next.js + Supabase + Vercel
- If the idea needs AI: default to Python + FastAPI + OpenRouter
- If the idea is a mobile app: default to Expo + React Native
```

### 6B. Time-Bound Resource Retrieval

**💻 Dev (Developer)**: _The Researcher Agent must bias toward speed-optimized resources:_

```python
SEARCH_SUFFIXES = [
    "quickstart guide",
    "tutorial in 10 minutes",
    "crash course 2024",
    "step by step beginner",
]

async def generate_search_queries(idea: str) -> list[str]:
    # LLM generates base queries, we append speed-biased suffixes
    base_queries = await llm_client.generate(...)
    return [f"{q} {random.choice(SEARCH_SUFFIXES)}" for q in base_queries]
```

### 6C. Dynamic Task Chunking (The Hardest Problem)

**🏗️ Ive-Infra**: _This is our single hardest engineering challenge. Here's the strict output schema:_

```python
class AtomicTask(BaseModel):
    title: str                          # "Set up Supabase project and create users table"
    description: str                    # Detailed, actionable instruction
    duration_minutes: int = Field(ge=20, le=90)  # HARD CONSTRAINT: 20-90 min
    dependencies: list[str] = []        # Task IDs that must complete first
    difficulty: Literal["easy", "medium", "hard"]
    resources: list[str] = []           # 1-2 quickstart links
```

_The Scheduler Agent then plays **Calendar Tetris**:_

```
1. Read user's calendar gaps for next 4 weeks
2. Sort tasks by dependency order
3. For each task:
   a. Find the first available gap ≥ task.duration_minutes
   b. If no gap fits: SPLIT the task into two sub-tasks (each ≥ 20 min)
   c. Assign to the gap + write to calendar API
4. If user hits "Reschedule" → re-run from step 2 with updated calendar data
```

**🎨 Jony (Designer)**: _From the UX perspective — when the schedule is generated, I want the user to see a beautiful timeline view, like a Gantt chart simplified for mobile. Each task block is color-coded by difficulty (easy=green, medium=amber, hard=red). Tapping a block reveals the full description + resources._

> ### ✅ DECISION 6: Prompt Engineering Strategy Adopted
>
> - **Opinionated PM Agent**: Always decide, never present options. Bias toward fastest MVP path.
> - **Time-Bound Resources**: Append "quickstart" / "in 10 minutes" to research searches.
> - **Atomic Task Schema**: Pydantic model with `duration_minutes` constrained to 20–90 min.
> - **Calendar Tetris Algorithm**: Greedy fit tasks into gaps, auto-split if gap < task duration.

---

## Revised Architecture Diagram

```
┌─────────────────────────────────────────────────────┐
│                   EXPO + REACT NATIVE               │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐ │
│  │   Home   │ │  Detail  │ │ Schedule │ │ Streak │ │
│  └──────────┘ └──────────┘ └──────────┘ └────────┘ │
│          MMKV (offline)  │  Reanimated 3 (60fps)    │
└────────────────────┬────────────────────────────────┘
                     │ HTTPS / SSE
                     ▼
┌─────────────────────────────────────────────────────┐
│               FASTAPI (Python 3.12+)                │
│  ┌──────────────────────────────────────────────┐   │
│  │  Gateway Layer: Pydantic + Depends(auth)     │   │
│  └──────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────┐   │
│  │  Service Layer: Pure business logic          │   │
│  └──────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────┐   │
│  │  Agent Functions: research / schedule / dig  │   │
│  └──────────────────────────────────────────────┘   │
└───────┬──────────┬──────────────┬───────────────────┘
        │          │              │
   ┌────▼────┐ ┌───▼───┐  ┌──────▼──────┐
   │ Supabase│ │Upstash│  │ ARQ Workers │
   │  Auth + │ │ Redis │  │ (async bg)  │
   │Realtime │ │ Cache │  └──────┬──────┘
   └─────────┘ └───────┘         │
                          ┌──────▼──────┐
                          │  LLM Tier   │
                          │ 1: Groq     │
                          │ 2: Together │
                          │ 3: Gemini   │
                          └──────┬──────┘
                                 │
                          ┌──────▼──────┐
                          │   Tavily    │
                          │  (Search)   │
                          └─────────────┘

   ┌─────────────────────────────────┐
   │  PostgreSQL (Neon / Supabase)   │
   │  SQLAlchemy 2.0 + Alembic      │
   │  (+ pgvector in Phase 2)       │
   └─────────────────────────────────┘
```

---

## Summary: What Changed from Meeting #1

| Decision        | Meeting #1                | Meeting #2 (Final)                          |
| --------------- | ------------------------- | ------------------------------------------- |
| Backend         | Next.js 15 App Router     | **FastAPI (Python 3.12+)**                  |
| Validation      | Zod                       | **Pydantic v2**                             |
| ORM             | Prisma                    | **SQLAlchemy 2.0 + Alembic**                |
| Background Jobs | Inngest                   | **ARQ (Redis-backed)**                      |
| LLM Strategy    | OpenRouter (Gemini Flash) | **Tiered: Groq → Together.ai → Gemini**     |
| Local Dev LLM   | N/A                       | **Ollama + Llama 3.2**                      |
| Agent Framework | Simple async (JS)         | **Simple async (Python) — no LangChain**    |
| Vector DB       | N/A                       | **Deferred to Phase 2 (pgvector)**          |
| Auth            | Supabase Auth             | **Supabase Auth (unchanged)** ✅            |
| Realtime        | Supabase Realtime         | **Supabase Realtime (unchanged)** ✅        |
| Mobile          | Expo + MMKV + Reanimated  | **Expo + MMKV + Reanimated (unchanged)** ✅ |
| Design          | Dark-first, gold accent   | **Dark-first, gold accent (unchanged)** ✅  |

> [!IMPORTANT]
> **Orchestrator's Final Statement**: _Meeting #2 represents a significant but correct architectural pivot. Python is the natural language for AI-agentic backends. The Global Rules survive through Pydantic and FastAPI equivalents. Open-source LLMs via Groq give us near-zero AI inference costs. The product intelligence concepts from the Gemini consultation (Opinionated PM Agent, Dynamic Task Chunking) elevate our agent quality. The council is aligned. Execute._
