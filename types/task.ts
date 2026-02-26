/**
 * Task-related domain types.
 */

export type TaskDifficulty = "easy" | "medium" | "hard";
export type TaskStatus = "pending" | "in_progress" | "completed" | "skipped";

export interface Task {
  id: string;
  ideaId: string;
  title: string;
  description: string;
  durationMinutes: number; // 20–90 min (atomic task constraint)
  difficulty: TaskDifficulty;
  status: TaskStatus;
  scheduledDate: string; // ISO date
  scheduledStartTime: string; // "09:00"
  resources: string[]; // Quickstart links
  order: number;
}
