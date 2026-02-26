/**
 * User and authentication types.
 */

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  streakCount: number;
  longestStreak: number;
  momentumScore: number; // 0–100 overall momentum
  totalIdeas: number;
  completedTasks: number;
  joinedAt: string;
}
