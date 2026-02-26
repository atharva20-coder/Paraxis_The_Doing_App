import { Idea } from "@/types/idea";

export const MOCK_IDEAS: Idea[] = [
  {
    id: "1",
    title: "AI-Powered Recipe Generator",
    description:
      "An app that generates weekly meal plans based on dietary preferences, allergies, and what is currently in your fridge. Uses computer vision to scan fridge contents.",
    category: "Mobile App",
    status: "researched",
    createdAt: "2026-02-20T10:30:00Z",
    momentum: 72,
  },
  {
    id: "2",
    title: "Freelancer Invoice Tracker",
    description:
      "A simple tool for freelancers to track invoices, send payment reminders, and visualize cash-flow with beautiful charts.",
    category: "SaaS",
    status: "scheduled",
    createdAt: "2026-02-22T14:00:00Z",
    momentum: 45,
  },
  {
    id: "3",
    title: "Neighborhood Tool Library",
    description:
      "A community platform where neighbors can lend and borrow tools (drills, ladders, etc.), reducing waste and building trust.",
    category: "Web App",
    status: "draft",
    createdAt: "2026-02-25T09:15:00Z",
    momentum: 0,
  },
  {
    id: "4",
    title: "Smart Study Planner",
    description:
      "An AI-powered study companion that breaks down exam syllabi into daily micro-tasks, tracks retention via spaced repetition, and adapts the schedule based on performance.",
    category: "Mobile App",
    status: "in_progress",
    createdAt: "2026-02-18T08:00:00Z",
    momentum: 88,
  },
  {
    id: "5",
    title: "Pet Health Tracker",
    description:
      "Track your pet's vet visits, vaccinations, medications, and daily activity. Get AI-powered health alerts based on breed-specific patterns.",
    category: "Mobile App",
    status: "done",
    createdAt: "2026-02-10T16:45:00Z",
    momentum: 100,
  },
];
