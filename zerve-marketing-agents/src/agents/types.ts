export type Level = "low" | "medium" | "high";
export type FunnelStage = "TOFU" | "MOFU" | "BOFU";

// ---- SEO: keyword research ----
export interface Keyword {
  keyword: string;
  intent: string;
  estVolume: Level;
  estDifficulty: Level;
  funnelStage: FunnelStage;
  priorityScore: number; // 1-100
}
export interface KeywordCluster {
  name: string;
  theme: string;
  keywords: Keyword[];
}
export interface KeywordResearch {
  summary: string;
  clusters: KeywordCluster[];
}

// ---- SEO: content brief ----
export interface OutlineItem {
  heading: string;
  level: "H2" | "H3";
  points: string[];
}
export interface Faq {
  question: string;
  answer: string;
}
export interface ContentBrief {
  targetKeyword: string;
  searchIntent: string;
  audience: string;
  titleOptions: string[];
  metaDescription: string;
  targetWordCount: number;
  keywordsToInclude: string[];
  outline: OutlineItem[];
  faqs: Faq[];
  internalLinkIdeas: string[];
  externalReferenceIdeas: string[];
  notes: string;
}

// ---- Content strategist: gap analysis ----
export interface ContentGap {
  title: string;
  funnelStage: FunnelStage;
  format: string;
  rationale: string;
  targetKeywords: string[];
  impact: Level;
  effort: Level;
  priorityScore: number; // 1-100
}
export interface GapAnalysis {
  summary: string;
  themes: string[];
  gaps: ContentGap[];
}

// ---- Content strategist: calendar ----
export interface CalendarItem {
  week: number;
  title: string;
  format: string;
  funnelStage: FunnelStage;
  primaryKeyword: string;
  goal: string;
  owner: string;
}
export interface ContentCalendar {
  summary: string;
  items: CalendarItem[];
}
