/**
 * Core domain types for the SPARK app.
 */

export type IdeaStatus =
  | "draft"
  | "researching"
  | "researched"
  | "scheduled"
  | "in_progress"
  | "done";
export type IdeaCategory =
  | "Mobile App"
  | "Web App"
  | "SaaS"
  | "API / Backend"
  | "AI / ML"
  | "Other";

export interface Idea {
  id: string;
  title: string;
  description: string;
  category: IdeaCategory;
  status: IdeaStatus;
  createdAt: string;
  momentum: number; // 0–100
}
