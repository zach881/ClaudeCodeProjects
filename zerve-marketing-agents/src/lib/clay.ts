/**
 * Clay integration via the Anthropic MCP connector.
 *
 * The Outreach agent reaches Clay's enrichment tools (find-and-enrich-company,
 * find-and-enrich-contacts-at-company, find-and-enrich-list-of-contacts, …) by
 * having Claude connect to Clay's MCP server during the request — the same
 * tools available in development, but wired into the deployed app.
 *
 * Configure with:
 *   CLAY_MCP_URL          Clay's MCP server URL
 *   CLAY_MCP_AUTH_TOKEN   Bearer token for that server (optional if the URL is
 *                         pre-authenticated)
 *
 * When unset, the Outreach agent falls back to public web-search enrichment
 * (company facts only — never fabricated emails).
 */

export function isClayConfigured(): boolean {
  return Boolean(process.env.CLAY_MCP_URL);
}

/** mcp_servers block for the Messages API (empty when Clay isn't configured). */
export function clayMcpServers(): Record<string, unknown>[] {
  const url = process.env.CLAY_MCP_URL;
  if (!url) return [];
  const server: Record<string, unknown> = {
    type: "url",
    name: "clay",
    url,
  };
  if (process.env.CLAY_MCP_AUTH_TOKEN) {
    server.authorization_token = process.env.CLAY_MCP_AUTH_TOKEN;
  }
  return [server];
}
