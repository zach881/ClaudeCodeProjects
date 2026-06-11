import { structuredCall } from "@/lib/anthropic";
import { ZERVE_CONTEXT } from "@/lib/zerve-context";
import { gapAnalysisSchema, contentCalendarSchema } from "@/agents/schemas";
import type {
  GapAnalysis,
  ContentCalendar,
  ContentGap,
} from "@/agents/types";

const STRATEGIST_SYSTEM = `
You are the Content Strategist Agent for Zerve's internal marketing platform.
You analyse the existing content portfolio against business goals, find the gaps
that matter, and plan what to publish next — prioritising by revenue/funnel
impact, not volume for its own sake.

You think in funnel stages (TOFU = awareness, MOFU = consideration,
BOFU = decision) and look for missing stages, missing formats, and missing
topics for Zerve's ICP. impact and effort are honest low/medium/high estimates;
priorityScore is an integer 1-100 weighting high impact and low effort highest.

${ZERVE_CONTEXT}
`.trim();

/** Content gap analysis from the current portfolio + goals. */
export async function analyzeGaps(input: {
  existingContent: string[];
  goals: string;
}): Promise<GapAnalysis> {
  const existing =
    input.existingContent.length > 0
      ? input.existingContent.map((c, i) => `${i + 1}. ${c}`).join("\n")
      : "(none provided — assume an early-stage content portfolio)";

  const prompt = `
Here is Zerve's current published content (titles / topics):
${existing}

Business goals for this planning cycle:
${input.goals}

Identify 6-12 high-value content gaps. For each, state the funnel stage, the
recommended format (e.g. guide, comparison, tutorial, case study, landing page,
template), why it matters for Zerve's ICP and goals, the target keywords/topics,
and honest impact/effort ratings. Surface cross-cutting themes you see across
the gaps, and keep the summary to 2-4 sentences of strategic direction.
`.trim();

  return structuredCall<GapAnalysis>({
    system: STRATEGIST_SYSTEM,
    prompt,
    schema: gapAnalysisSchema,
    enableSearch: true,
    researchQuery: `Research what data-science / AI-engineering audiences are currently reading and what competing platforms publish, relevant to these goals: ${input.goals}`,
  });
}

/** Build a week-by-week content calendar. */
export async function buildCalendar(input: {
  weeks: number;
  focus: string;
  gaps?: ContentGap[];
}): Promise<ContentCalendar> {
  const gapsBlock = input.gaps?.length
    ? `Draw from these previously identified gaps where they fit:\n${input.gaps
        .map((g) => `- ${g.title} (${g.funnelStage}, ${g.format})`)
        .join("\n")}`
    : "No prior gap analysis provided — propose a balanced slate yourself.";

  const prompt = `
Build a ${input.weeks}-week content calendar for Zerve.

Focus / theme for this cycle: ${input.focus}

${gapsBlock}

Schedule 1-2 pieces per week (week numbers 1..${input.weeks}). Balance funnel
stages and formats across the calendar, give each item a primary keyword, a
one-line goal, and a suggested owner role (e.g. "Content writer", "DevRel",
"Founder"). Keep the summary to 2-4 sentences explaining the sequencing logic.
`.trim();

  return structuredCall<ContentCalendar>({
    system: STRATEGIST_SYSTEM,
    prompt,
    schema: contentCalendarSchema,
    enableSearch: false,
  });
}
