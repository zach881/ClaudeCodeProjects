/**
 * JSON schemas for Claude structured outputs. Structured outputs require every
 * object to set additionalProperties:false and list all keys in `required`, and
 * they do not support numeric/length constraints (those are enforced via the
 * prompt instead). Enums are supported and we use them for the rating fields.
 */

const LEVEL = { type: "string", enum: ["low", "medium", "high"] };
const FUNNEL = { type: "string", enum: ["TOFU", "MOFU", "BOFU"] };

function obj(properties: Record<string, unknown>) {
  return {
    type: "object",
    properties,
    required: Object.keys(properties),
    additionalProperties: false,
  };
}
const strArray = { type: "array", items: { type: "string" } };

export const keywordResearchSchema = obj({
  summary: { type: "string" },
  clusters: {
    type: "array",
    items: obj({
      name: { type: "string" },
      theme: { type: "string" },
      keywords: {
        type: "array",
        items: obj({
          keyword: { type: "string" },
          intent: { type: "string" },
          estVolume: LEVEL,
          estDifficulty: LEVEL,
          funnelStage: FUNNEL,
          priorityScore: { type: "integer" },
        }),
      },
    }),
  },
});

export const contentBriefSchema = obj({
  targetKeyword: { type: "string" },
  searchIntent: { type: "string" },
  audience: { type: "string" },
  titleOptions: strArray,
  metaDescription: { type: "string" },
  targetWordCount: { type: "integer" },
  keywordsToInclude: strArray,
  outline: {
    type: "array",
    items: obj({
      heading: { type: "string" },
      level: { type: "string", enum: ["H2", "H3"] },
      points: strArray,
    }),
  },
  faqs: {
    type: "array",
    items: obj({ question: { type: "string" }, answer: { type: "string" } }),
  },
  internalLinkIdeas: strArray,
  externalReferenceIdeas: strArray,
  notes: { type: "string" },
});

export const gapAnalysisSchema = obj({
  summary: { type: "string" },
  themes: strArray,
  gaps: {
    type: "array",
    items: obj({
      title: { type: "string" },
      funnelStage: FUNNEL,
      format: { type: "string" },
      rationale: { type: "string" },
      targetKeywords: strArray,
      impact: LEVEL,
      effort: LEVEL,
      priorityScore: { type: "integer" },
    }),
  },
});

export const contentCalendarSchema = obj({
  summary: { type: "string" },
  items: {
    type: "array",
    items: obj({
      week: { type: "integer" },
      title: { type: "string" },
      format: { type: "string" },
      funnelStage: FUNNEL,
      primaryKeyword: { type: "string" },
      goal: { type: "string" },
      owner: { type: "string" },
    }),
  },
});
