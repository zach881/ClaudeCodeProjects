import { structuredCall, gatherWithMcp } from "@/lib/anthropic";
import { ZERVE_CONTEXT } from "@/lib/zerve-context";
import { isClayConfigured, clayMcpServers } from "@/lib/clay";
import { enrichmentSchema, sequenceSchema } from "@/agents/schemas";
import type { EnrichmentResult, OutreachSequence } from "@/agents/types";

const OUTREACH_SYSTEM = `
You are the Outreach Agent for Zerve's internal marketing platform. You research
and enrich target accounts and contacts, and write personalized B2B outreach
sequences for Zerve's ICP (data scientists, ML/AI engineers, and heads of data /
AI at scale-ups and enterprises).

You qualify accounts against Zerve's ICP honestly — say when an account is a poor
fit. You never fabricate contact details: only include an email or LinkedIn URL
if it came from enrichment data; otherwise leave it blank. Personalization must
be specific and grounded in real signals (role, tech stack, hiring, news), never
generic flattery.

${ZERVE_CONTEXT}
`.trim();

/**
 * Enrich a target account + contacts. Uses Clay via the MCP connector when
 * configured (real firmographics, contacts, and emails); otherwise falls back to
 * public web-search enrichment (company facts only, no fabricated emails).
 */
export async function enrichTarget(input: {
  companyDomain: string;
  roleKeywords?: string[];
  contactNames?: string[];
}): Promise<EnrichmentResult> {
  const roleLine = input.roleKeywords?.length
    ? `Target roles/titles: ${input.roleKeywords.join(", ")}.`
    : "Target the roles most likely to own evaluating a platform like Zerve (e.g. Head of Data Science / ML Platform, senior ML engineers).";
  const namedLine = input.contactNames?.length
    ? `Specifically find these named people: ${input.contactNames.join(", ")}.`
    : "";

  let findings = "";
  let source = "web-search";

  if (isClayConfigured()) {
    source = "clay";
    findings = await gatherWithMcp({
      system: OUTREACH_SYSTEM,
      mcpServers: clayMcpServers(),
      prompt: `
Use the Clay tools to enrich the account "${input.companyDomain}".
1. Enrich the company (firmographics, tech stack, recent signals where available).
2. Find and enrich relevant contacts. ${roleLine} ${namedLine}
3. For the most relevant contacts, get their work email where possible.

Report what Clay returned as clear notes: company facts, and for each contact
their name, title, seniority, location, LinkedIn URL, and email if found.
`.trim(),
    });
  }

  const groundingBlock = findings
    ? `Enrichment data returned by Clay (use only this for contact details; do not invent emails):\n${findings}`
    : "No Clay enrichment available — use public web search for company facts only, and leave contact emails blank.";

  const prompt = `
Build an enrichment profile for the account "${input.companyDomain}".
${roleLine} ${namedLine}

${groundingBlock}

Produce a tight company profile, 3-6 prioritized contacts (most relevant first),
and an honest one-paragraph "fit" assessment against Zerve's ICP. For each
contact, include 2-3 specific personalization hooks an SDR could open with. Set
the "source" field to "${source}".
`.trim();

  const result = await structuredCall<EnrichmentResult>({
    system: OUTREACH_SYSTEM,
    prompt,
    schema: enrichmentSchema,
    enableSearch: !findings, // only web-search when we have no Clay findings
    researchQuery: findings
      ? undefined
      : `Research the company at ${input.companyDomain}: what they do, industry, rough size, tech stack, and any recent news.`,
  });

  result.source = source;
  return result;
}

/** Draft a personalized multi-touch outreach sequence for a prospect. */
export async function draftSequence(input: {
  prospectName: string;
  prospectCompany: string;
  prospectContext: string;
  campaignGoal: string;
  channel: "email" | "linkedin" | "multi";
  steps: number;
}): Promise<OutreachSequence> {
  const channelGuidance = {
    email: "All steps are email.",
    linkedin: "All steps are LinkedIn messages (connection note + follow-ups). Keep them short.",
    multi: "Mix email and LinkedIn touches sensibly across the sequence.",
  }[input.channel];

  const prompt = `
Write a ${input.steps}-step outreach sequence to ${input.prospectName} at
${input.prospectCompany}.

What we know about the prospect / account:
${input.prospectContext || "(limited info — keep personalization to role/company level and avoid specifics you can't support)"}

Campaign goal: ${input.campaignGoal}
Channel: ${channelGuidance}

Rules:
- Step 1 leads with a specific, relevant hook — not "I hope this finds you well".
- Tie the value to a concrete pain Zerve solves for this person's role.
- Emails: <=120 words, one clear CTA, plain text, no jargon soup. Subject lines
  short and curiosity/value driven.
- Each step has a dayOffset (days from start), e.g. 0, 3, 7, 12.
- For each step include a one-line rationale (why this angle, why now).
- Do not invent product features, customers, pricing, or metrics.
`.trim();

  return structuredCall<OutreachSequence>({
    system: OUTREACH_SYSTEM,
    prompt,
    schema: sequenceSchema,
    enableSearch: false,
  });
}
