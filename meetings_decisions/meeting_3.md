# 🏁 Third Council Meeting – Final Architecture Summary

**Date:** 26 Feb 2026 · 16:45 IST

---

## 🎯 Goal

Synthesize the decisions from Meeting 1 (initial Next.js‑centric plan) and Meeting 2 (Python FastAPI pivot) into a single, concrete technical blueprint for the **SPARK** app.

---

## 📚 Final Tech Stack

| Layer                       | Technology                                                                                                                                                                                                                                                                                    | Reasoning                                                                                                     |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| **Mobile Front‑end**        | **Expo React Native** (MMKV for offline storage, Reanimated 3 for 60 fps animations)                                                                                                                                                                                                          | Cross‑platform, native feel, already approved in Meeting 1.                                                   |
| **API Gateway / Backend**   | **FastAPI (Python 3.12+)**                                                                                                                                                                                                                                                                    | Best fit for AI‑heavy workloads, native async, Pydantic v2 gives Zod‑like strict validation (Zero‑Patchwork). |
| **ORM / DB**                | **SQLAlchemy 2.0 (async) + Alembic** → **PostgreSQL on Neon**                                                                                                                                                                                                                                 | Prisma‑style strict typing, supports `null` normalization, easy migrations.                                   |
| **Authentication**          | **Supabase Auth** (JWT)                                                                                                                                                                                                                                                                       | Free, works with both mobile and FastAPI via JWT verification.                                                |
| **Realtime / Push**         | **Supabase Realtime** + **Expo Push Notifications** (FCM under the hood)                                                                                                                                                                                                                      | Low‑latency updates, already in the original PRD.                                                             |
| **Caching / Rate‑Limiting** | **Upstash Redis** (Redis 7)                                                                                                                                                                                                                                                                   | Shared cache for LLM responses, rate‑limit buckets for public endpoints.                                      |
| **Background Jobs**         | **ARQ (Redis‑backed async queue)**                                                                                                                                                                                                                                                            | Light‑weight Python alternative to Inngest; uses the same Upstash Redis instance.                             |
| **LLM / AI**                | **Tiered strategy**:<br>1️⃣ **Groq (Llama 3.1 70B)** – free tier, fastest for most calls.<br>2️⃣ **Together.ai (Llama 3.1 70B)** – paid but cheap for complex synthesis.<br>3️⃣ **Gemini Flash (OpenRouter)** – fallback when others fail.<br>**Local dev**: **Ollama** + **Llama 3.2 3B** (₹0). | Meets the “minimum AI cost” requirement while keeping quality.                                                |
| **Search**                  | **Tavily** (quick‑search API)                                                                                                                                                                                                                                                                 | Provides fast web‑search results for the Research Agent.                                                      |
| **Vector Store (Phase 2)**  | **pgvector** (PostgreSQL extension)                                                                                                                                                                                                                                                           | Enables semantic similarity for the Enhancement Agent once the app scales (>1 k users).                       |
| **CI/CD / Hosting**         | **Railway / Fly.io** (Docker containers) – optional **Vercel** for a lightweight Next.js admin dashboard.                                                                                                                                                                                     | Simple, zero‑config deployments; Vercel kept only for an optional web UI, no business logic.                  |

---

## 🏗️ Architecture Overview

```
+-------------------+        +-------------------+        +-------------------+
|   Expo (RN) App   | <---> |   FastAPI Server   | <---> |   PostgreSQL DB   |
|  (MMKV, Reanimated) |   Auth/ JWT   |   (SQLAlchemy)   |
+-------------------+        +-------------------+        +-------------------+
        |                         |                         |
        |   +-----------------+   |   +-----------------+   |
        +---|   ARQ Workers   |---+---|   LLM Clients   |---+
            (Redis queue)       |   (Groq / Together / Gemini) |
                                 +-----------------+
        |                         |
        |   +-----------------+   |
        +---|   Tavily Search |---+
            +-----------------+
        |
        |   +-----------------+   +-----------------+
        +---| Supabase Auth   |---| Supabase Realtime |
            +-----------------+   +-----------------+
```

_All request flow follows the **Gateway Pattern**:_ `Auth → Validation (Pydantic) → Service → Response`.

---

## 📡 API Design (Gateway Layer)

All endpoints are **RESTful**, versioned under `/api/v1`. Responses follow the standardized JSON envelope:

```json
{
  "data": {...},
  "error": null
}
```

If an error occurs:

```json
{
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR" | "UNAUTHORIZED" | "INTERNAL_SERVER_ERROR",
    "message": "Human readable message",
    "details": []
  }
}
```

### Core Endpoints

| Method | Path                 | Purpose                                       | Service Function                                    |
| ------ | -------------------- | --------------------------------------------- | --------------------------------------------------- |
| `POST` | `/api/v1/ideas`      | Create a new Idea (brain‑dump)                | `idea_service.create(user_id, IdeaCreateInput)`     |
| `GET`  | `/api/v1/ideas/{id}` | Retrieve Idea + research results              | `idea_service.get(id, user_id)`                     |
| `POST` | `/api/v1/research`   | Trigger Research Agent for an Idea            | `research_agent.run(idea_id, idea_text)` (ARQ task) |
| `POST` | `/api/v1/schedule`   | Atomize tasks, write to Google/Apple calendar | `scheduler_agent.schedule(idea_id, user_id)` (ARQ)  |
| `GET`  | `/api/v1/tasks`      | List scheduled atomic tasks for a user        | `task_service.list(user_id, filters)`               |
| `POST` | `/api/v1/enhance`    | 40 % completion hook – run Enhancement Agent  | `enhancement_agent.run(idea_id)` (ARQ)              |
| `GET`  | `/api/v1/health`     | Liveness / readiness probe                    | –                                                   |

All **POST** bodies are validated with **Pydantic models** that mirror the Zod schemas from the original Next.js rules (e.g. `nullish().transform(v => v ?? null)`).

---

## 🛠️ Tooling & Patterns

| Concern                   | Implementation                                                                                                                                                                                                                                                                                          |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Authentication**        | FastAPI dependency `get_current_user` verifies Supabase JWT, injects `AuthenticatedUser` into routes.                                                                                                                                                                                                   |
| **Validation**            | Pydantic v2 models with `field: Optional[str] = None` → automatically normalizes `undefined` → `None`.                                                                                                                                                                                                  |
| **Service Layer**         | Pure async functions in `app/services/` that only interact with the DB via SQLAlchemy. No business logic lives in route handlers.                                                                                                                                                                       |
| **Background Processing** | `ARQ` workers consume tasks from Upstash Redis. Each agent (`research_agent`, `scheduler_agent`, `enhancement_agent`) is a single async function enqueued via `await arq.enqueue(...)`.                                                                                                                 |
| **Caching**               | LLM request payloads are hashed (SHA‑256) and cached in Redis for 12 h. Cache‑first strategy reduces token usage dramatically.                                                                                                                                                                          |
| **Rate Limiting**         | Upstash Redis token bucket per IP / user for public endpoints (`/login`, `/signup`, heavy write ops).                                                                                                                                                                                                   |
| **Prompt Engineering**    | **Opinionated PM Agent** – always decides the fastest stack, never presents alternatives. **Dynamic Task Chunking** – agents output an `AtomicTask` Pydantic model with `duration_minutes` (20‑90 min) and the **Calendar‑Tetris** scheduler fits tasks into user‑free slots, splitting when necessary. |
| **Error Handling**        | Central exception handler converts Python exceptions into the standardized error JSON envelope.                                                                                                                                                                                                         |
| **Observability**         | **BetterStack** logs emitted via `structlog` with JSON payloads; trace IDs propagate through async calls.                                                                                                                                                                                               |
| **Testing**               | Unit tests for each service layer (pytest + async fixtures). Integration tests hit the FastAPI test client, asserting the 422 validation flow and the `null` normalization.                                                                                                                             |

---

## 📅 Final Decisions (Consensus)

1. **Backend** – FastAPI + Pydantic + SQLAlchemy (Python) is the final API gateway.
2. **LLM** – Tiered open‑source models (Groq → Together.ai → Gemini) with local Ollama for dev.
3. **Background Jobs** – ARQ on Upstash Redis (lightweight, fits Python stack).
4. **Vector Store** – Deferred to Phase 2 via `pgvector`.
5. **Agent Architecture** – Simple async functions, no LangChain/CrewAI.
6. **Prompt Strategies** – Opinionated PM Agent & Dynamic Task Chunking become core to the product.
7. **Mobile** – Expo React Native remains unchanged; UI/UX guidelines from Meeting 1 stay.
8. **Rate‑Limiting & Security** – Upstash Redis buckets, IDOR checks via compound `where` clauses, never expose secret fields.
9. **Deployment** – Docker containers on Railway/Fly.io; optional Next.js admin dashboard on Vercel (purely UI, no business logic).

---

## ✅ Next Steps

- **Implementation Plan** will be updated to reflect the FastAPI stack (already done).
- Generate the **initial FastAPI project skeleton** (`npx -y create-fastapi-app@latest ./`‑style) and commit.
- Scaffold Pydantic schemas, SQLAlchemy models, and ARQ worker entry‑points.
- Wire Supabase Auth verification middleware.
- Build the first three API routes (`/ideas`, `/research`, `/schedule`).
- Integrate the LLMClient abstraction with the tiered model selection.
- Begin mobile‑to‑backend integration tests.

---

_Prepared by the Agent Council (Orchestrator Pichai, Architect Ive‑Infra, Developer Dev, Designer Jony)._
