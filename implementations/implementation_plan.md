# ⚡ SPARK App — Master Implementation Plan

**Based on**: [Council Meeting #3 – Final Architecture Summary](file:///Users/atharvajoshi/Documents/paraxis_the_doing_app/meetings_decisions/meeting_3.md)  
**Created**: 26 Feb 2026

---

## Overview

This plan is structured in **5 phases**. Phase 1 is frontend-first: the UI/UX Designer Agent designs every screen, interaction, and animation spec — then the Developer Agent builds them with **hardcoded mock data** so we can visualize the full app before wiring any backend.

---

# Phase 1 · Frontend UI Shell (Hardcoded Data)

> **Lead agents**: 🎨 UI/UX Designer → 💻 Developer  
> **Goal**: A fully navigable, 60 fps Expo app with premium dark-mode UI, all screens built, powered by hardcoded JSON fixtures.

## Step 1A — UI/UX Design Specifications (Designer Agent)

The Designer Agent produces a **Screen Specification Document** for every screen before a single line of code is written.

### Screens to Design

| #   | Screen                     | Key Elements                                                                                                   |
| --- | -------------------------- | -------------------------------------------------------------------------------------------------------------- |
| 1   | **Onboarding (3-slide)**   | App value prop, Lottie animations, "Get Started" CTA                                                           |
| 2   | **Auth (Login / Sign-up)** | Magic-link email input, Google OAuth button, minimal form                                                      |
| 3   | **Home (Idea Feed)**       | Idea cards with status chips (Draft / Researching / Scheduled / Done), FAB for new idea, streak counter header |
| 4   | **New Idea (Brain Dump)**  | Full-screen text input, voice-to-text toggle, category picker, "SPARK it" submit button                        |
| 5   | **Idea Detail**            | Collapsible research accordion, tech-stack tags, "Schedule" CTA, "Dig Deeper" streaming section                |
| 6   | **Schedule View**          | Gantt-lite timeline, color-coded task blocks (easy=green, medium=amber, hard=red), tap-to-expand               |
| 7   | **Task Execution**         | Single-task focus view, timer, "Mark Complete" with confetti animation, "Reschedule" option                    |
| 8   | **Streak & Momentum**      | LeetCode-style heatmap, momentum score ring, weekly stats                                                      |
| 9   | **Settings / Profile**     | Calendar integrations toggle, notification prefs, theme selector, account management                           |
| 10  | **Empty States**           | Beautiful empty states for: no ideas, no tasks, no streak — instructional + motivating                         |

### Design Deliverables per Screen

For each screen, the Designer Agent must specify:

1. **Layout Blueprint** — Exact padding (px), margins, safe-area insets, thumb-zone placement of CTAs
2. **Color Tokens** — Mapped to the design system (background: `#000000`, surface: `#1A1A1A`, accent: `#FFB800`, text-primary: `#FFFFFF`, text-secondary: `#8E8E93`)
3. **Typography Scale** — Font family (Inter/SF Pro), sizes, weights, line-heights for each text element
4. **Component States** — Default, pressed, disabled, loading, error for every interactive element
5. **Animation Specs** — Trigger, duration, easing curve (spring/ease-out), Reanimated worklet reference
6. **Haptic Feedback** — Which interactions trigger light/medium/heavy haptics
7. **Accessibility** — WCAG AAA contrast ratios, screen-reader labels, minimum touch targets (44×44pt)

---

## Step 1B — Project Setup (Developer Agent)

### 1B.1 · Initialize Expo Project

```bash
npx create-expo-app@latest spark-app --template blank-typescript
cd spark-app
```

### 1B.2 · Install Core Dependencies

```bash
# Navigation
npx expo install @react-navigation/native @react-navigation/bottom-tabs @react-navigation/native-stack react-native-screens react-native-safe-area-context

# Animations & Gestures
npx expo install react-native-reanimated react-native-gesture-handler

# Local Storage
npx expo install react-native-mmkv

# UI Essentials
npx expo install expo-haptics expo-linear-gradient expo-blur expo-font

# Icons
npx expo install @expo/vector-icons
```

### 1B.3 · Project Structure

```
spark-app/
├── app/                          # Expo Router (file-based routing)
│   ├── (auth)/                   # Auth screens group
│   │   ├── login.tsx
│   │   └── onboarding.tsx
│   ├── (tabs)/                   # Main tab navigator
│   │   ├── index.tsx             # Home / Idea Feed
│   │   ├── schedule.tsx          # Schedule View
│   │   ├── streak.tsx            # Streak & Momentum
│   │   └── settings.tsx          # Settings / Profile
│   ├── idea/
│   │   ├── new.tsx               # Brain Dump screen
│   │   └── [id].tsx              # Idea Detail screen
│   ├── task/
│   │   └── [id].tsx              # Task Execution screen
│   └── _layout.tsx               # Root layout
├── components/                   # Reusable UI components
│   ├── ui/                       # Primitives (Button, Card, Badge, Input)
│   ├── idea/                     # Idea-specific (IdeaCard, ResearchAccordion)
│   ├── schedule/                 # Schedule-specific (TaskBlock, GanttRow)
│   └── streak/                   # Streak-specific (Heatmap, MomentumRing)
├── constants/                    # Design tokens, colors, typography, spacing
│   ├── Colors.ts
│   ├── Typography.ts
│   └── Spacing.ts
├── hooks/                        # Custom hooks
│   └── useHaptics.ts
├── fixtures/                     # Hardcoded mock data (JSON)
│   ├── ideas.ts
│   ├── tasks.ts
│   ├── user.ts
│   └── research.ts
├── types/                        # TypeScript interfaces
│   ├── idea.ts
│   ├── task.ts
│   └── user.ts
└── utils/                        # Shared utilities
    └── animations.ts             # Reanimated shared worklets
```

### 1B.4 · Design System Implementation

**File: `constants/Colors.ts`**

```typescript
export const Colors = {
  background: "#000000", // Pure OLED black
  surface: "#1A1A1A", // Elevated cards
  surfaceLight: "#2A2A2A", // Hover/pressed state
  accent: "#FFB800", // Gold — primary action
  accentDim: "#FFB80033", // Gold at 20% opacity
  success: "#34C759", // Task complete
  warning: "#FF9500", // Amber — medium difficulty
  danger: "#FF3B30", // Destructive only
  textPrimary: "#FFFFFF",
  textSecondary: "#8E8E93",
  textTertiary: "#636366",
  border: "#2C2C2E",
  glass: "rgba(255,255,255,0.08)", // Glassmorphism tint
} as const;
```

### 1B.5 · Hardcoded Mock Data

**File: `fixtures/ideas.ts`**

```typescript
import { Idea } from "@/types/idea";

export const MOCK_IDEAS: Idea[] = [
  {
    id: "1",
    title: "AI-Powered Recipe Generator",
    description:
      "An app that generates weekly meal plans based on dietary preferences and what is in your fridge.",
    category: "Mobile App",
    status: "researched",
    createdAt: "2026-02-20T10:30:00Z",
    momentum: 72,
  },
  {
    id: "2",
    title: "Freelancer Invoice Tracker",
    description:
      "A simple tool for freelancers to track invoices, send reminders, and see payment status.",
    category: "SaaS",
    status: "scheduled",
    createdAt: "2026-02-22T14:00:00Z",
    momentum: 45,
  },
  {
    id: "3",
    title: "Neighborhood Tool Library",
    description:
      "A community platform where neighbors can lend and borrow tools, reducing waste.",
    category: "Web App",
    status: "draft",
    createdAt: "2026-02-25T09:15:00Z",
    momentum: 0,
  },
];
```

### 1B.6 · Build Order (Screen by Screen)

| Order | Screen                                                              | Depends On                            |
| ----- | ------------------------------------------------------------------- | ------------------------------------- |
| 1     | Design System (`Colors`, `Typography`, `Spacing`, `Button`, `Card`) | Nothing                               |
| 2     | Root Layout + Tab Navigator                                         | Design System                         |
| 3     | Home / Idea Feed                                                    | `IdeaCard` component, `MOCK_IDEAS`    |
| 4     | New Idea (Brain Dump)                                               | `Input`, `CategoryPicker`             |
| 5     | Idea Detail                                                         | `ResearchAccordion`, `MOCK_RESEARCH`  |
| 6     | Schedule View                                                       | `TaskBlock`, `GanttRow`, `MOCK_TASKS` |
| 7     | Task Execution                                                      | Timer component, confetti animation   |
| 8     | Streak & Momentum                                                   | `Heatmap`, `MomentumRing`             |
| 9     | Settings / Profile                                                  | Toggle components                     |
| 10    | Onboarding + Auth                                                   | Lottie animations, auth form          |
| 11    | Empty States                                                        | All screens                           |

---

# Phase 2 · Backend API (FastAPI + PostgreSQL)

> **Lead agents**: 🏗️ Architect → 💻 Developer

- Initialize FastAPI project with `uv` (Python package manager)
- Setup SQLAlchemy 2.0 async models + Alembic migrations
- Implement Supabase JWT verification middleware
- Build core endpoints: `POST /ideas`, `GET /ideas/{id}`, `GET /tasks`
- Wire Upstash Redis for caching + rate-limiting
- Standardized error envelope on all responses

---

# Phase 3 · AI Agents (Research, Schedule, Enhance)

> **Lead agents**: 🏗️ Architect → 💻 Developer

- Build unified `LLMClient` with tiered fallback (Groq → Together → Gemini)
- Implement Research Agent as ARQ async worker
- Implement Scheduler Agent with Dynamic Task Chunking (20–90 min atomic tasks)
- Implement Calendar Tetris algorithm for gap-fitting
- Integrate Tavily Search API with Redis caching
- Wire Expo Push Notifications via Supabase Realtime

---

# Phase 4 · Integration (Frontend ↔ Backend)

> **Lead agents**: 💻 Developer → 🎨 Designer (polish)

- Replace all hardcoded fixtures with live API calls
- Implement MMKV → FastAPI sync queue (offline-first)
- Wire Supabase Auth flow (Magic Link + Google OAuth)
- Connect Supabase Realtime channels for agent status updates
- Implement optimistic UI updates on writes
- Skeleton loaders that match exact data shapes

---

# Phase 5 · Polish, Testing & Launch

> **Lead agents**: All agents

- Enhancement Agent + Dig-Deeper streaming (SSE)
- Streak tracking & Momentum score calculations
- Idea Collision & Dormant Idea rescue notifications
- End-to-end testing (Detox for mobile, pytest for backend)
- App Store assets and metadata
- RevenueCat subscription integration
- Performance audit (60 fps on low-end Android)

---

## Execution Readiness Checklist

- [x] Tech stack finalized (Meeting #3)
- [x] Screen inventory defined (10 screens + empty states)
- [x] Design system tokens specified
- [x] Project structure specified
- [x] Mock data schema defined
- [x] Build order defined
- [ ] **⏳ Awaiting approval to begin execution**
