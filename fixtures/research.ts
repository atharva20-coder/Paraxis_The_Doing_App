import { ResearchResult } from "@/types/research";

export const MOCK_RESEARCH: Record<string, ResearchResult> = {
  "1": {
    id: "r1",
    ideaId: "1",
    summary:
      "An AI-powered recipe generator is a strong market opportunity. Key competitors include Whisk (Samsung), Mealime, and Supercook. The differentiator here is the fridge-scanning feature using computer vision, which none of the top 5 competitors offer natively.",
    sections: [
      {
        title: "Market Analysis",
        content:
          "The meal planning app market was valued at $1.2B in 2025 and is projected to reach $2.8B by 2030. Key drivers include health consciousness and food waste reduction. Primary competitors (Mealime, Yummly, Whisk) focus on manual recipe browsing with limited AI personalization.",
      },
      {
        title: "Technical Approach",
        content:
          "Use Expo Camera for image capture. Send the photo to Google Cloud Vision API or a fine-tuned YOLO model for ingredient detection. Feed detected ingredients into a recipe-matching algorithm backed by the Spoonacular API or Edamam.",
      },
      {
        title: "MVP Scope",
        content:
          "Start with manual ingredient input (Phase 1), then add camera scanning (Phase 2). Focus on dietary filters (vegan, keto, gluten-free) and a weekly meal planner that generates a shopping list.",
      },
    ],
    techStack: [
      {
        name: "Expo + React Native",
        reason: "Cross-platform mobile with camera access",
        link: "https://expo.dev",
      },
      {
        name: "FastAPI",
        reason: "Lightweight Python backend for AI orchestration",
        link: "https://fastapi.tiangolo.com",
      },
      {
        name: "Supabase",
        reason: "Auth + PostgreSQL + Realtime for free",
        link: "https://supabase.com",
      },
      {
        name: "Spoonacular API",
        reason: "Recipe database with nutritional data",
        link: "https://spoonacular.com/food-api",
      },
    ],
    estimatedTotalHours: 48,
    competitorInsights: [
      "Mealime: Strong UX but no AI personalization. 4.8★ on App Store.",
      "Whisk (Samsung): Backed by Samsung but poor discoverability.",
      "Supercook: Ingredient-based search but no meal planning features.",
    ],
    createdAt: "2026-02-20T11:00:00Z",
  },
};
