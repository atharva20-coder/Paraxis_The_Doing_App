import { Task } from "@/types/task";

export const MOCK_TASKS: Task[] = [
  {
    id: "t1",
    ideaId: "1",
    title: "Set up Expo project with TypeScript",
    description:
      "Initialize a new Expo project using the blank-typescript template. Configure ESLint and Prettier.",
    durationMinutes: 30,
    difficulty: "easy",
    status: "completed",
    scheduledDate: "2026-02-26",
    scheduledStartTime: "09:00",
    resources: ["https://docs.expo.dev/get-started/create-a-project/"],
    order: 1,
  },
  {
    id: "t2",
    ideaId: "1",
    title: "Implement Supabase Auth (Magic Link)",
    description:
      "Set up Supabase client, configure magic-link authentication flow, and build login/signup screens.",
    durationMinutes: 60,
    difficulty: "medium",
    status: "in_progress",
    scheduledDate: "2026-02-26",
    scheduledStartTime: "10:00",
    resources: [
      "https://supabase.com/docs/guides/auth/quickstarts/react-native",
    ],
    order: 2,
  },
  {
    id: "t3",
    ideaId: "1",
    title: "Design database schema for recipes",
    description:
      "Create SQLAlchemy models for recipes, ingredients, and meal plans. Write Alembic migration.",
    durationMinutes: 45,
    difficulty: "medium",
    status: "pending",
    scheduledDate: "2026-02-27",
    scheduledStartTime: "09:00",
    resources: ["https://docs.sqlalchemy.org/en/20/tutorial/"],
    order: 3,
  },
  {
    id: "t4",
    ideaId: "1",
    title: "Build fridge scanning UI with camera",
    description:
      "Use expo-camera to capture fridge contents. Send image to vision API for ingredient extraction.",
    durationMinutes: 90,
    difficulty: "hard",
    status: "pending",
    scheduledDate: "2026-02-27",
    scheduledStartTime: "14:00",
    resources: ["https://docs.expo.dev/versions/latest/sdk/camera/"],
    order: 4,
  },
  {
    id: "t5",
    ideaId: "2",
    title: "Set up FastAPI backend with Pydantic",
    description:
      "Initialize FastAPI project, configure CORS, and create Pydantic models for invoices.",
    durationMinutes: 45,
    difficulty: "easy",
    status: "pending",
    scheduledDate: "2026-02-28",
    scheduledStartTime: "09:00",
    resources: ["https://fastapi.tiangolo.com/tutorial/"],
    order: 1,
  },
];
