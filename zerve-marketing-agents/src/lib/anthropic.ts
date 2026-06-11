import Anthropic from "@anthropic-ai/sdk";

/**
 * Shared Anthropic client + model config for every agent.
 *
 * We default to claude-opus-4-8 (the most capable model) because the agents do
 * multi-step reasoning over business context and live search results. The client
 * resolves credentials from ANTHROPIC_API_KEY in the environment.
 */
export const AGENT_MODEL = process.env.ZERVE_AGENT_MODEL ?? "claude-opus-4-8";

let client: Anthropic | null = null;

export function getClient(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error(
      "ANTHROPIC_API_KEY is not set. Copy .env.example to .env and add your key.",
    );
  }
  if (!client) client = new Anthropic();
  return client;
}

/** Extract the concatenated text of an Anthropic message response. */
export function messageText(message: Anthropic.Message): string {
  return message.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("");
}

const WEB_SEARCH_TOOL = { type: "web_search_20260209", name: "web_search" };

/**
 * Gather grounded research as free-form text using server-side web search.
 *
 * This is kept separate from structured output on purpose: web search emits
 * citations, which are incompatible with a forced JSON schema. So we research
 * first (text), then structure second (no tools). Loops over pause_turn, which
 * the server emits when the search loop hits its iteration cap.
 */
async function gatherResearch(system: string, query: string): Promise<string> {
  const anthropic = getClient();
  const messages: Anthropic.MessageParam[] = [
    { role: "user", content: query },
  ];
  const body = {
    model: AGENT_MODEL,
    max_tokens: 8000,
    thinking: { type: "adaptive" },
    output_config: { effort: "high" },
    system,
    tools: [WEB_SEARCH_TOOL],
    messages,
  };

  let final: Anthropic.Message | null = null;
  for (let i = 0; i < 6; i++) {
    const response = await anthropic.messages.create(
      body as unknown as Anthropic.MessageCreateParamsNonStreaming,
    );
    if (response.stop_reason === "pause_turn") {
      messages.push({ role: "assistant", content: response.content });
      continue;
    }
    final = response;
    break;
  }
  return final ? messageText(final) : "";
}

/**
 * Gather information using remote MCP servers (e.g. Clay enrichment) as free-form
 * text. Like gatherResearch, this is the "tool" phase kept separate from the JSON
 * structuring phase. Uses the beta MCP connector + adaptive thinking.
 */
export async function gatherWithMcp(opts: {
  system: string;
  prompt: string;
  mcpServers: Record<string, unknown>[];
  maxTokens?: number;
}): Promise<string> {
  const anthropic = getClient();
  const messages: Anthropic.MessageParam[] = [
    { role: "user", content: opts.prompt },
  ];
  const body = {
    model: AGENT_MODEL,
    max_tokens: opts.maxTokens ?? 12000,
    thinking: { type: "adaptive" },
    output_config: { effort: "high" },
    system: opts.system,
    mcp_servers: opts.mcpServers,
    betas: ["mcp-client-2025-11-20"],
    messages,
  };

  let final: { content: unknown[]; stop_reason: string | null } | null = null;
  for (let i = 0; i < 8; i++) {
    const response = (await (
      anthropic as unknown as {
        beta: { messages: { create: (b: unknown) => Promise<unknown> } };
      }
    ).beta.messages.create(body)) as {
      content: Array<{ type: string; text?: string }>;
      stop_reason: string | null;
    };
    if (response.stop_reason === "pause_turn") {
      messages.push({
        role: "assistant",
        content: response.content as unknown as Anthropic.MessageParam["content"],
      });
      continue;
    }
    final = response;
    break;
  }
  if (!final) return "";
  return (final.content as Array<{ type: string; text?: string }>)
    .filter((b) => b.type === "text" && b.text)
    .map((b) => b.text as string)
    .join("");
}

/**
 * Run a structured-output request: Claude is constrained to a JSON schema and we
 * return the parsed object. Uses adaptive thinking + high effort for quality.
 *
 * When `enableSearch` is set, we do a grounded research pass first and feed the
 * findings into the structuring call (see gatherResearch). Request bodies are
 * cast because the newest fields (output_config.format, adaptive thinking, the
 * dated web_search tool) may sit ahead of the installed SDK's static types.
 */
export async function structuredCall<T>(opts: {
  system: string;
  prompt: string;
  schema: Record<string, unknown>;
  enableSearch?: boolean;
  researchQuery?: string;
  maxTokens?: number;
}): Promise<T> {
  const anthropic = getClient();

  let prompt = opts.prompt;
  if (opts.enableSearch) {
    const findings = await gatherResearch(
      opts.system,
      opts.researchQuery ?? opts.prompt,
    );
    if (findings.trim()) {
      prompt = `Current research findings (use where relevant; ignore anything irrelevant):\n${findings}\n\n---\n\n${opts.prompt}`;
    }
  }

  const body = {
    model: AGENT_MODEL,
    max_tokens: opts.maxTokens ?? 16000,
    thinking: { type: "adaptive" },
    system: opts.system,
    output_config: {
      effort: "high",
      format: { type: "json_schema", schema: opts.schema },
    },
    messages: [{ role: "user", content: prompt }],
  };

  const final = await anthropic.messages.create(
    body as unknown as Anthropic.MessageCreateParamsNonStreaming,
  );

  if (final.stop_reason === "refusal") {
    throw new Error("The model declined this request.");
  }

  const text = messageText(final).trim();
  try {
    return JSON.parse(text) as T;
  } catch {
    // Structured output should be pure JSON, but guard against stray prose.
    const match = text.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]) as T;
    throw new Error("Agent returned malformed JSON.");
  }
}

/**
 * Stream a long-form text generation (e.g. a blog draft) to a string, using the
 * SDK's accumulating stream helper so large outputs don't hit HTTP timeouts.
 */
export async function streamText(opts: {
  system: string;
  prompt: string;
  enableSearch?: boolean;
  maxTokens?: number;
  onDelta?: (text: string) => void;
}): Promise<string> {
  const anthropic = getClient();

  const body = {
    model: AGENT_MODEL,
    max_tokens: opts.maxTokens ?? 32000,
    thinking: { type: "adaptive" },
    output_config: { effort: "high" },
    system: opts.system,
    tools: opts.enableSearch ? [WEB_SEARCH_TOOL] : undefined,
    messages: [{ role: "user", content: opts.prompt }],
  };

  const stream = anthropic.messages.stream(
    body as unknown as Anthropic.MessageCreateParamsStreaming,
  );
  if (opts.onDelta) stream.on("text", opts.onDelta);
  const message = await stream.finalMessage();
  return messageText(message);
}
