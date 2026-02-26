/**
 * Research result types returned by the Research Agent.
 */

export interface ResearchSection {
  title: string;
  content: string;
}

export interface TechStackRecommendation {
  name: string;
  reason: string;
  link: string;
}

export interface ResearchResult {
  id: string;
  ideaId: string;
  summary: string;
  sections: ResearchSection[];
  techStack: TechStackRecommendation[];
  estimatedTotalHours: number;
  competitorInsights: string[];
  createdAt: string;
}
