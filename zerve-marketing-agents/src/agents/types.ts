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
  // Measured metrics layered in when an SEO data provider is configured.
  searchVolume?: number | null;
  keywordDifficulty?: number | null; // 0-100
  currentPosition?: number | null; // avg position if the site already ranks
  metricSource?: string; // e.g. "ahrefs", "search-console", "estimated"
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

// ---- Outreach agent ----
export interface EnrichedContact {
  name: string;
  title: string;
  seniority: string;
  location: string;
  linkedinUrl: string;
  email: string;
  relevanceToZerve: string;
  personalizationHooks: string[];
}
export interface CompanyProfile {
  name: string;
  domain: string;
  description: string;
  industry: string;
  headcount: string;
  techStack: string[];
  recentSignals: string[];
}
export interface EnrichmentResult {
  company: CompanyProfile;
  contacts: EnrichedContact[];
  fit: string; // why this account fits (or doesn't fit) Zerve's ICP
  source: string; // "clay" | "web-search"
}

export interface SequenceStep {
  step: number;
  channel: string; // email | linkedin
  dayOffset: number; // days from sequence start
  subject: string;
  body: string;
  rationale: string;
}
export interface OutreachSequence {
  prospectName: string;
  prospectCompany: string;
  summary: string;
  steps: SequenceStep[];
}
