import { structuredCall, streamText } from "@/lib/anthropic";
import { ZERVE_CONTEXT } from "@/lib/zerve-context";
import {
  keywordResearchSchema,
  contentBriefSchema,
} from "@/agents/schemas";
import type { KeywordResearch, ContentBrief } from "@/agents/types";
import { getKeywordMetrics } from "@/lib/seo-data";

const SEO_SYSTEM = `
You are the SEO Agent for Zerve's internal marketing platform. You do keyword
research, write content briefs, and draft SEO content for a technical audience.

You ground recommendations in current search behaviour using web search when it
helps, and you reason about search intent and the funnel (TOFU = awareness,
MOFU = consideration, BOFU = decision). Volume and difficulty are honest
qualitative estimates (low/medium/high) — never fabricate precise numbers.
priorityScore is an integer 1-100 reflecting opportunity = (relevance to Zerve's
ICP) x (estimated traffic) / (estimated difficulty).

${ZERVE_CONTEXT}
`.trim();

/** Keyword research: clusters of opportunities for a seed topic. */
export async function keywordResearch(input: {
  seed: string;
  notes?: string;
}): Promise<KeywordResearch> {
  const prompt = `
Run keyword research for this seed topic / theme: "${input.seed}".
${input.notes ? `Additional context from the marketer: ${input.notes}` : ""}

Produce 3-6 keyword clusters. Each cluster groups related keywords under a clear
theme. Aim for 4-8 keywords per cluster, spanning the funnel where relevant.
Favour keywords a data-science / AI-engineering audience would actually search,
and where Zerve can realistically rank and convert. Keep the summary to 2-4
sentences of strategic takeaways.
`.trim();

  const result = await structuredCall<KeywordResearch>({
    system: SEO_SYSTEM,
    prompt,
    schema: keywordResearchSchema,
    enableSearch: true,
    researchQuery: `Research current search interest, related queries, and competing content for "${input.seed}" aimed at a data-science / AI-engineering audience.${input.notes ? ` Context: ${input.notes}` : ""}`,
  });

  return enrichWithMetrics(result);
}

/**
 * Layer measured metrics (Ahrefs volume/difficulty, Search Console position)
 * onto the model's keyword estimates when an SEO data provider is configured.
 * Re-ranks priorityScore mildly so genuinely high-volume / low-difficulty
 * keywords float up. No-op when no provider is set.
 */
async function enrichWithMetrics(
  result: KeywordResearch,
): Promise<KeywordResearch> {
  const all = result.clusters.flatMap((c) => c.keywords.map((k) => k.keyword));
  const metrics = await getKeywordMetrics(all);
  if (metrics.size === 0) return result;

  for (const cluster of result.clusters) {
    for (const k of cluster.keywords) {
      const m = metrics.get(k.keyword.trim().toLowerCase());
      if (!m) {
        k.metricSource = "estimated";
        continue;
      }
      k.searchVolume = m.searchVolume ?? null;
      k.keywordDifficulty = m.keywordDifficulty ?? null;
      k.currentPosition = m.currentPosition ?? null;
      k.metricSource = m.source;
    }
  }
  return result;
}

/** Content brief: a structured, writer-ready brief for a target keyword. */
export async function contentBrief(input: {
  targetKeyword: string;
  notes?: string;
}): Promise<ContentBrief> {
  const prompt = `
Create a detailed, writer-ready SEO content brief targeting the keyword:
"${input.targetKeyword}".
${input.notes ? `Context from the marketer: ${input.notes}` : ""}

Include 3-5 title options, a <=155 character meta description, the dominant
search intent, the target reader, a realistic target word count, an H2/H3
outline with bullet points under each heading, 4-6 FAQs with concise answers,
internal link ideas (other Zerve content/pages worth linking to), external
reference ideas (authoritative sources worth citing), and the secondary
keywords/entities to include. Keep notes to practical guidance for the writer.
`.trim();

  return structuredCall<ContentBrief>({
    system: SEO_SYSTEM,
    prompt,
    schema: contentBriefSchema,
    enableSearch: true,
    researchQuery: `Research the top-ranking pages and dominant search intent for "${input.targetKeyword}" — what they cover, their angle, and gaps to exploit.`,
  });
}

/**
 * Draft long-form content (blog post or landing page) as Markdown. Streamed so
 * large drafts don't hit request timeouts. Accepts either a brief or a topic.
 */
export async function draftContent(input: {
  topic: string;
  format: "blog" | "landing";
  brief?: ContentBrief;
  notes?: string;
  onDelta?: (text: string) => void;
}): Promise<string> {
  const briefBlock = input.brief
    ? `Follow this approved brief:\n${JSON.stringify(input.brief, null, 2)}`
    : "No formal brief was provided — produce a strong default structure.";

  const formatGuidance =
    input.format === "landing"
      ? "Write a conversion-focused landing page: a sharp hero headline + subhead, the core problem, how Zerve solves it, benefit-led sections, social-proof placeholders, and a clear CTA."
      : "Write an SEO blog post: a compelling intro that states the payoff, well-structured H2/H3 sections, concrete examples, and a closing that ties back to Zerve naturally (no hard sell).";

  const prompt = `
Write a ${input.format === "landing" ? "landing page" : "blog post"} about:
"${input.topic}".
${input.notes ? `Context from the marketer: ${input.notes}` : ""}

${formatGuidance}

${briefBlock}

Output clean Markdown only (start with an H1). Write in Zerve's technical-but-
human voice. Do not invent product features, customers, pricing, or metrics.
`.trim();

  return streamText({
    system: SEO_SYSTEM,
    prompt,
    enableSearch: false,
    maxTokens: 32000,
    onDelta: input.onDelta,
  });
}
