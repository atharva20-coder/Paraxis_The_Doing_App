# ⚡ SPARK: The Doing App

SPARK is a premium, AI-powered mobile application built with React Native and Expo. It is designed to act as your intelligent sidekick—helping you capture raw ideas ("Sparks"), structure them into actionable plans, track your momentum through streaks, and execute them with the help of specialized AI agents.

## 🎨 Design Philosophy

The user interface and experiential design are deeply inspired by Jony Ive's principles:

- **Typography as UI**: Clean, readable, and structured hierarchy using Inter.
- **Fluid Motion & 60 FPS**: All animations utilize React Native's built-in `Animated` API to ensure buttery smooth performance without native module blockers (Expo Go compatible).
- **Tactile Feedback**: Haptic feedback attached to interactions to provide physical confirmation of digital actions.
- **Color Psychology**: Rich, deliberate use of color palettes. Accents are used systematically to define categories, statuses, and states—avoiding monochrome monotony while maintaining a premium feel.

## 🚀 Key Features

### 1. 💡 Capture Ideas ("New Spark")

- **Frictionless Entry**: Quickly dump your thoughts into the app.
- **Categorization**: Tag ideas dynamically (Mobile App, Web App, SaaS, API, AI/ML, Other) with distinct color themes.
- **Voice Input Ready**: UI designed to accommodate voice-to-text dictation.

### 2. 🤖 AI Chat Agents (Idea Details)

- Replaces traditional static action buttons with an interactive, pill-shaped AI chat interface.
- **Specialized Agents**: Trigger distinct AI personas (SPARK, Research, Schedule, Enhance) to assist with your specific idea.
- **Smart Suggestions**: Quick-action pills to jumpstart the conversation.

### 3. 🔥 Momentum & Streaks Dashboard

- **Data-Dense Layout**: A premium, "health-app" style dashboard visualizing productivity.
- **Visual Heatmap**: 7-week activity heatmap with varying intensity levels (GitHub style).
- **Detailed Metrics**: Track Longest Streak, Total Ideas, and Completed Tasks.
- **Milestones Track**: Unlockable milestones (1 week, 2 weeks, 1 month, 100 days) to keep you motivated.

### 4. 🔐 Seamless Onboarding & Auth

- **3-Slide Intro**: Beautifully animated onboarding carousel highlighting the app's value proposition.
- **Passwordless Auth**: Built to support Magic-link email inputs and Apple Sign-in integration.

## 🛠️ Tech Stack

- **Frontend Framework**: [React Native](https://reactnative.dev/) (via [Expo](https://expo.dev/))
- **Routing**: [Expo Router](https://docs.expo.dev/router/introduction/) (App Router paradigm)
- **Language**: TypeScript (Strict Mode)
- **Animations**: React Native `Animated`
- **Styling**: Context-aware custom styling utilizing a central `Colors` design system.
- **Backend/API**: Designed to connect with a FastAPI backend (Planned for Phase 4)

## 📦 Getting Started

### Prerequisites

- Node.js (>= 18.x)
- npm or yarn
- Expo Go app installed on your physical device, or an iOS Simulator / Android Emulator.

### Installation

1. **Clone the repository** (if applicable) and navigate to the project directory:

   ```bash
   cd spark-app
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

   _or if using yarn:_

   ```bash
   yarn install
   ```

3. **Start the Metro Bundler**:

   ```bash
   npx expo start
   ```

4. **Run the App**:
   - Press `i` to open in iOS Simulator
   - Press `a` to open in Android Emulator
   - Scan the QR code using the Expo Go app on your physical device.

## 🏗️ Project Structure

```text
spark-app/
├── app/                  # Expo Router filesystem routing
│   ├── (auth)/           # Authentication & Onboarding flows
│   ├── (tabs)/           # Main application shell (Home, Schedule, Streak, Settings)
│   ├── idea/             # Idea detail and creation screens
│   ├── task/             # Task execution screens
│   ├── _layout.tsx       # Root layout & routing logic
│   └── +not-found.tsx    # 404 screen
├── components/           # Reusable UI components
├── constants/            # Design tokens (Colors, Spacing, Typography)
├── fixtures/             # Mock data for UI development
├── hooks/                # Custom React hooks (e.g., useOnboarding)
├── implementations/      # Design and implementation specs
├── Team/                 # System prompts and agent guidelines
└── types/                # TypeScript type definitions
```

## 🗺️ Roadmap & Current Phase

- [x] **Phase 1**: Initial project setup and architecture guidelines.
- [x] **Phase 2**: Onboarding & Authentication UI (Expo Go compatible).
- [x] **Phase 3**: Premium structural UI overhaul (Home, Spark Creation, Streaks Dashboard, AI Chat UI).
- [ ] **Phase 4**: Backend integration (FastAPI), real AI/LLM connections, Auth logic, and Database persistence.
