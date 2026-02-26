# ⚡ SPARK — Agent Council Meeting #1

**Date**: 26 Feb 2026 · 16:27 IST  
**Agenda**: Finalize Tech Stack, AI Agent Pipeline, APIs, Architecture, and UI/UX  
**Attendees**:
| Agent | Role | Codename |
|---|---|---|
| 🎯 Orchestrator | Technical Product Manager (15 yrs, ex-Google Chrome) | **Pichai** |
| 🏗️ System Architect | Distinguished System Architect (10 yrs, LLD/HLD) | **Ive-Infra** |
| 💻 Developer | Principal Software Engineer (8 yrs, Full-Stack + GenAI) | **Dev** |
| 🎨 UI/UX Designer | Principal Designer (10 yrs, ex-Apple Design Lead) | **Jony** |

---

## Agenda Item 1: Backend & Database Stack

> [!IMPORTANT]
> **The Core Conflict**: The PRD specifies **Supabase + Cloudflare Workers**. The Enterprise Global Rules mandate **Next.js 15 App Router + Prisma + Neon PostgreSQL**. This must be resolved before a single line of code is written.

**🎯 Pichai (Orchestrator)**: _We are not going to waste a single week debating this. A mobile-first app needs a stable, typed API backend. Following the Global Rules, the API Gateway will live in Next.js 15. However, we aren't here to throw out good tech for ideological purity. Supabase offers free Auth and free Realtime channels. If it saves us 2 weeks of engineering, we use it. Architect, lay out the hybrid._

**🏗️ Ive-Infra (Architect)**: _Agreed. Here is the ruling:_

- **Database**: Neon PostgreSQL + Prisma ORM. This gives us strict type safety, deterministic migrations, and serverless connection pooling. Supabase DB is not used.
- **Auth**: Supabase Auth. It provides magic link, Google OAuth, and Apple Sign-In out of the box for free. Rolling custom auth is a waste of time at this stage.
- **Realtime**: Supabase Realtime Channels for broadcasting agent status updates ("Researching…", "Scheduling…") to the mobile app. This is decoupled from the DB layer.
- **API Gateway**: Next.js 15 App Router, deployed on Vercel. Every route follows strict Auth → Zod → Service → Response.
- **Background Jobs**: Inngest, hosted as a Next.js API route (`/api/inngest`).

**💻 Dev (Developer)**: _This works. I want to confirm: Prisma Client will be the sole interface with Neon. No raw SQL, no Supabase client for DB queries. The Supabase JS SDK is used only for Auth and Realtime. This boundary is critical to prevent leaky abstractions._

**🎨 Jony (Designer)**: _From a UX standpoint, Supabase Auth's pre-built magic link flow saves us designing a full password reset system. I approve._

> ### ✅ DECISION 1: Hybrid Architecture
>
> | Layer                   | Technology                         | Justification                                                    |
> | ----------------------- | ---------------------------------- | ---------------------------------------------------------------- |
> | Database                | **Neon PostgreSQL + Prisma**       | Type-safe, strict migrations, serverless pooling                 |
> | Auth                    | **Supabase Auth**                  | Free. Magic link, Google, Apple Sign-In. Zero custom auth code   |
> | Realtime                | **Supabase Realtime Channels**     | Free. Decoupled from DB. Broadcasts agent status to mobile app   |
> | API Gateway             | **Next.js 15 App Router (Vercel)** | Strict typed gateway. Follows Enterprise Zero-Patchwork rules    |
> | Background Jobs         | **Inngest (via Next.js route)**    | 50k free runs/month. Perfect for async AI agent execution        |
> | Caching / Rate Limiting | **Upstash Redis**                  | 10k commands/day free. Caches LLM outputs, rate-limits endpoints |

---

## Agenda Item 2: AI Agent Pipeline & Cost Control

**🎯 Pichai**: _This is the make-or-break. Our budget is ₹0 until we hit revenue. Every single LLM token costs real money. Architect, design the pipeline. Developer, tell me how we keep costs near zero._

**🏗️ Ive-Infra (Architect)**: _The pipeline design:_

```
User submits idea → Next.js API validates → Inngest event fired →
  ├─ Research Agent (Inngest function):
  │    1. Hash the idea text → check Redis cache
  │    2. If cache HIT → return cached research (₹0 cost)
  │    3. If cache MISS:
  │       a. LLM Call #1: Generate 5 search queries (Gemini 1.5 Flash, ~200 output tokens)
  │       b. Tavily: Execute 5 searches in parallel
  │       c. LLM Call #2: Synthesize results into strict JSON (Gemini Flash, ~1500 output tokens)
  │       d. Store result in Neon DB + cache in Redis (TTL: 7 days)
  │       e. Broadcast via Supabase Realtime → Push notification via Expo
  │
  ├─ Scheduler Agent (triggered by user action):
  │    1. Read calendar free/busy via OAuth (Google/Microsoft)
  │    2. LLM Call: Break research steps into atomic tasks + assign to slots (Gemini Flash, JSON mode)
  │    3. Write events to calendar API
  │    4. Save tasks to Neon DB
  │
  ├─ Dig-Deeper Agent (on-demand, streaming):
  │    1. User taps "Tell me more" on any research bullet
  │    2. SSE stream from Next.js API route (Claude 3 Haiku via OpenRouter)
  │    3. No background queue needed — this is a synchronous stream
  │
  ├─ Enhancement Agent (auto-trigger at 40% task completion):
  │    1. Inngest cron checks task completion %
  │    2. If ≥ 40% → fire research with updated context
  │
  └─ Rescue Agent (daily cron at 6 PM IST):
       1. Query users inactive > 48h
       2. Find smallest incomplete task
       3. Push notification
```

**💻 Dev (Developer)**: _Critical cost controls I will enforce:_

1. **All LLM calls use `response_format: { type: "json_object" }`** — structured JSON output prevents rambling and cuts output tokens by ~60%.
2. **Strict `max_tokens` caps**: Research synthesis capped at 2000 tokens. Query generation capped at 300 tokens. Scheduling capped at 1500 tokens.
3. **Redis cache key = SHA-256 hash of normalized idea text**. If two users submit "Build a habit tracker app", the second one costs ₹0.
4. **Tavily calls are rate-limited per user**: Free tier users get 3 research runs/month (= max 15 Tavily calls). Pro users get unlimited but still cached.

**🎯 Pichai**: _What's our projected cost at 1,000 MAU?_

**🏗️ Ive-Infra**: _Assuming 30% cache hit rate:_
| Resource | Usage | Monthly Cost |
|---|---|---|
| LLM (Gemini Flash via OpenRouter) | ~21M tokens | ~₹150 |
| Tavily Search | ~2,100 calls | ₹2,900 (paid plan at $35) |
| Inngest | ~9,000 runs | Free (under 50k limit) |
| Upstash Redis | ~8,000 cmds/day | Free (under 10k limit) |
| **Total** | | **~₹3,050/month** |

_Recoverable with just 16 Pro subscribers at ₹199/mo._

> ### ✅ DECISION 2: AI Agent Pipeline
>
> - **Primary LLM**: Gemini 1.5 Flash via OpenRouter (cheapest, fastest for structured output)
> - **Streaming LLM**: Claude 3 Haiku via OpenRouter (Dig-Deeper only, streamed via SSE)
> - **Fallback LLM**: GPT-4o-mini (used only if primary fails twice)
> - **Search**: Tavily API (cached aggressively in Redis, TTL 7 days)
> - **All agents are simple async functions** — no LangChain, no agent frameworks
> - **Redis caching layer intercepts all LLM calls** before they hit OpenRouter

---

## Agenda Item 3: API Design & Contracts

**🎯 Pichai**: _Developer, define the API surface. Architect, validate every route._

**💻 Dev (Developer)**: _Here is the complete v1 API surface:_

| Method   | Route                        | Auth      | Description                                         |
| -------- | ---------------------------- | --------- | --------------------------------------------------- |
| `POST`   | `/api/auth/callback`         | Public    | Supabase Auth callback handler                      |
| `GET`    | `/api/ideas`                 | Protected | List user's ideas (cursor-paginated, `take: 20`)    |
| `POST`   | `/api/ideas`                 | Protected | Create new idea → triggers Inngest `idea.submitted` |
| `GET`    | `/api/ideas/[id]`            | Protected | Get idea detail + research result (IDOR protected)  |
| `PATCH`  | `/api/ideas/[id]`            | Protected | Update idea status (archive, dormant)               |
| `DELETE` | `/api/ideas/[id]`            | Protected | Soft-delete idea                                    |
| `POST`   | `/api/ideas/[id]/schedule`   | Protected | Trigger Scheduler Agent                             |
| `POST`   | `/api/ideas/[id]/dig-deeper` | Protected | SSE stream for Dig-Deeper Agent                     |
| `GET`    | `/api/tasks`                 | Protected | List user's upcoming tasks (cursor-paginated)       |
| `PATCH`  | `/api/tasks/[id]`            | Protected | Mark task done / reschedule                         |
| `GET`    | `/api/streak`                | Protected | Get streak data + heatmap                           |
| `GET`    | `/api/user/preferences`      | Protected | Get scheduling preferences                          |
| `PUT`    | `/api/user/preferences`      | Protected | Set scheduling preferences                          |
| `POST`   | `/api/calendar/connect`      | Protected | Initiate OAuth for Google/Microsoft Calendar        |
| `DELETE` | `/api/user`                  | Protected | Account deletion (App Store requirement)            |

**🏗️ Ive-Infra (Architect)**: _Every Protected route follows the strict Gateway pattern:_

```typescript
// 1. Authenticate
const session = await getSession(request);
if (!session) return errorResponse("UNAUTHORIZED", 401);

// 2. Await + Validate
const { id } = await params;
const body = await request.json();
const parsed = IdeaCreateSchema.safeParse(body);
if (!parsed.success)
  return errorResponse("VALIDATION_ERROR", 422, parsed.error.issues);

// 3. Execute (pure service call)
const result = await ideaService.create(session.user.id, parsed.data);

// 4. Respond
return NextResponse.json(result, { status: 201 });
```

_Every `[id]` route must include the IDOR ownership check: `where: { id, userId: session.user.id }`._

**🎨 Jony (Designer)**: _For the Dig-Deeper streaming endpoint — I need the SSE to send incremental text chunks so I can render a smooth typewriter animation on the mobile app. Each SSE event should contain a `delta` field with the text chunk, not the entire accumulated text._

**💻 Dev**: _Agreed. The SSE format will be:_

```
data: {"type":"delta","content":"The best approach to..."}\n\n
data: {"type":"delta","content":" building a habit tracker..."}\n\n
data: {"type":"done","content":""}\n\n
```

> ### ✅ DECISION 3: API Contracts
>
> - **16 API routes** for v1 (lean and sufficient)
> - All follow the **Auth → Zod → Service → Response** gateway pattern
> - All `[id]` routes enforce **IDOR** via compound `where` clause
> - Dig-Deeper uses **SSE with delta chunks** for real-time streaming
> - All list endpoints use **cursor-based pagination** (`take: 20`)
> - Error responses follow the **standardized JSON error format**

---

## Agenda Item 4: Mobile Architecture & Offline Strategy

**🎯 Pichai**: _The PRD mandates offline-first with WatermelonDB. Designer, what's the UX expectation? Developer, is WatermelonDB still the right call?_

**🎨 Jony (Designer)**: _The UX requirement is instant capture. When a user types an idea and hits Save, it must appear in their idea list within 100ms — regardless of network state. There should be zero "Saving…" spinners for local operations. The sync indicator should be a subtle, non-intrusive icon (a small cloud with a checkmark when synced, a rotating arrow when syncing)._

**💻 Dev (Developer)**: _WatermelonDB is powerful but heavy. For our v1, the offline requirement is narrow: we only need to cache the idea list and allow offline idea creation. I propose:_

1. **v1 (Ship fast)**: Use **MMKV** (via `react-native-mmkv`) for blazing-fast local key-value storage. Store the idea list as a serialized JSON array. New ideas are written to MMKV instantly and queued for sync.
2. **v2 (If needed)**: Migrate to WatermelonDB only if we need complex offline queries, relational data, or multi-table sync.

_MMKV is 30x faster than AsyncStorage and has zero native setup complexity. It reduces our Week 2 scope by ~3 days._

**🏗️ Ive-Infra (Architect)**: _I agree with the Developer. WatermelonDB introduces a full SQLite layer with its own migration system — that's a second database to manage alongside Prisma. MMKV + a simple sync queue is the architecturally lean choice. The sync queue pattern:_

```
1. User creates idea → write to MMKV immediately (optimistic)
2. Enqueue a POST /api/ideas request in a background sync queue
3. When network is available, flush the queue in order
4. On success: update the MMKV entry with the server-assigned ID
5. On failure: retry with exponential backoff (max 3 retries)
```

**🎨 Jony**: _As long as the UI feels instant, I approve. But I need the sync status to be observable so I can show the subtle cloud icon state._

> ### ✅ DECISION 4: Mobile Architecture
>
> | Layer              | Technology                          | Justification                                               |
> | ------------------ | ----------------------------------- | ----------------------------------------------------------- |
> | Framework          | **Expo SDK 52 + React Native**      | One codebase, both platforms                                |
> | Navigation         | **Expo Router (file-based)**        | Convention over configuration                               |
> | Local Storage (v1) | **MMKV** (react-native-mmkv)        | 30x faster than AsyncStorage, zero setup                    |
> | Offline Sync       | **Custom sync queue** (MMKV-backed) | Lean. No SQLite overhead. Upgradeable to WatermelonDB later |
> | Animations         | **React Native Reanimated 3**       | 60fps native thread animations                              |
> | Micro-animations   | **Lottie React Native**             | Free animations from LottieFiles                            |
> | Push Notifications | **Expo Notifications**              | Handles APNs + FCM                                          |
> | Voice Input        | **Expo Speech API**                 | On-device, free                                             |
> | Subscriptions      | **RevenueCat**                      | Free under $2,500 MRR                                       |

---

## Agenda Item 5: UI/UX System & Design Language

**🎯 Pichai**: _Jony, you have the floor. Define the visual language for SPARK. Make it feel like an Apple product, not a hackathon project._

**🎨 Jony (Designer)**: _Here is the SPARK Design System:_

### Color System (Dark-First, OLED-Optimized)

| Token                | Value                    | Usage                                           |
| -------------------- | ------------------------ | ----------------------------------------------- |
| `--bg-primary`       | `#000000`                | Pure black. OLED power savings. Main background |
| `--bg-elevated`      | `#1C1C1E`                | Card surfaces, bottom sheets                    |
| `--bg-glass`         | `rgba(28,28,30,0.72)`    | Glassmorphism overlays (blur: 20px)             |
| `--accent-primary`   | `#FFB800`                | SPARK gold. Used for CTAs, streaks, momentum    |
| `--accent-secondary` | `#007AFF`                | Trust blue. Links, informational elements       |
| `--text-primary`     | `#FFFFFF`                | Primary text                                    |
| `--text-secondary`   | `#8E8E93`                | Muted labels, timestamps                        |
| `--success`          | `#30D158`                | Task completed, synced                          |
| `--destructive`      | `#FF453A`                | Delete, archive only                            |
| `--agent-glow`       | `#FFB800` at 30% opacity | Pulsing border when agent is actively working   |

### Typography (San Francisco / Inter)

| Token        | Size | Weight         | Usage              |
| ------------ | ---- | -------------- | ------------------ |
| `heading-xl` | 34px | Bold (700)     | Screen titles      |
| `heading-lg` | 28px | Semibold (600) | Section headers    |
| `body`       | 17px | Regular (400)  | Standard text      |
| `body-small` | 15px | Regular (400)  | Card subtitles     |
| `caption`    | 13px | Medium (500)   | Timestamps, labels |

### Spacing & Radius

| Token           | Value                |
| --------------- | -------------------- |
| `spacing-xs`    | 4px                  |
| `spacing-sm`    | 8px                  |
| `spacing-md`    | 16px                 |
| `spacing-lg`    | 24px                 |
| `spacing-xl`    | 32px                 |
| `radius-card`   | 16px                 |
| `radius-button` | 12px                 |
| `radius-chip`   | 20px (fully rounded) |

### Animation Curves

| Animation                 | Curve                                           | Duration |
| ------------------------- | ----------------------------------------------- | -------- |
| Screen transitions        | `Easing.bezier(0.25, 0.1, 0.25, 1.0)`           | 350ms    |
| Bottom sheet open         | `spring({ damping: 20, stiffness: 300 })`       | ~400ms   |
| Card press scale          | `withSpring({ damping: 15, stiffness: 400 })`   | 150ms    |
| Agent glow pulse          | `withRepeat(withTiming(1, { duration: 1500 }))` | Infinite |
| Task completion checkmark | Lottie animation, 40 frames                     | 800ms    |

### Key Screen Behaviors

1. **Home / Idea Inbox**: Idea cards with swipe gestures (left: archive, right: mark task done). Active agent cards pulse with `--agent-glow` border. Pull-to-refresh with haptic feedback.
2. **New Idea Sheet**: Bottom sheet with spring physics. Text input auto-focuses. Voice button toggles on-device speech recognition. Category chips are horizontally scrollable.
3. **Idea Detail (Research Output)**: Typewriter animation on first load. Collapsible accordion sections. Each bullet is tappable for Dig-Deeper. Sticky bottom bar with "Schedule It" CTA in `--accent-primary`.
4. **Streak Dashboard**: GitHub-style heatmap using `--accent-primary` intensity gradient. Current streak count is prominently large (heading-xl). Momentum score displayed as a circular progress ring.

**🏗️ Ive-Infra**: _The `--agent-glow` animation must run on the UI thread via Reanimated's `useAnimatedStyle`, not via `setState`. If we animate border color via JS state, we'll drop to 30fps on older Android devices._

**💻 Dev**: _Confirmed. All glow/pulse animations will use `useSharedValue` + `useAnimatedStyle` from Reanimated 3. Zero JS thread involvement._

> ### ✅ DECISION 5: Design Language
>
> - **Theme**: Dark-first, OLED-optimized, gold accent (`#FFB800`)
> - **Font**: System font (San Francisco on iOS, Roboto on Android), fallback Inter
> - **All animations**: React Native Reanimated 3 on UI thread, spring physics
> - **Component states**: Every component must define `default`, `pressed`, `disabled`, `loading`, and `error` states
> - **Glassmorphism**: Applied to bottom sheets and floating headers with `blur: 20px`

---

## Final Action Items

| #   | Action                                                                 | Owner               | Deadline |
| --- | ---------------------------------------------------------------------- | ------------------- | -------- |
| 1   | Initialize Next.js 15 project (`spark-api`) with Prisma + Neon         | **Dev**             | Day 1    |
| 2   | Initialize Expo project (`spark-app`) with MMKV + Reanimated           | **Dev**             | Day 1    |
| 3   | Define complete Prisma schema (Users, Ideas, Tasks, Research, Streaks) | **Architect**       | Day 2    |
| 4   | Define all Zod schemas with `nullish().transform(v => v ?? null)`      | **Architect + Dev** | Day 2    |
| 5   | Design Figma wireframes for Home, New Idea Sheet, Idea Detail          | **Jony**            | Day 3    |
| 6   | Implement Supabase Auth (magic link + Google OAuth) in Next.js         | **Dev**             | Day 3    |
| 7   | Build Research Agent v1 (Inngest + Tavily + Gemini Flash)              | **Dev**             | Day 5    |
| 8   | Build Home Screen with Idea Cards + swipe gestures                     | **Dev + Jony**      | Day 5    |

---

> [!NOTE]
> **Orchestrator's Closing Statement**: _This meeting has resolved every architectural ambiguity. We are building a hybrid stack — Next.js 15 for the typed API gateway, Supabase for free auth and realtime, Prisma + Neon for the database, MMKV for lean offline storage, and Inngest for background AI agents. The design language is dark-first, gold-accented, and buttery smooth at 60fps. The AI pipeline is cost-controlled with aggressive Redis caching. Ship Week 1 by Day 5. No debates. Execute._
