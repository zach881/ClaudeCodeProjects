# Zerve Marketing Agents

An internal AI marketing-agent platform for **Zerve**, inspired by
[Graphed](https://www.graphed.com/). It deploys autonomous agents that you
configure in plain language; each one researches, reasons, and returns a
structured, ready-to-use result. This first build ships two agents:

- **SEO Agent** — keyword research (with funnel mapping + priority scoring),
  writer-ready content briefs, and full Markdown drafts. Grounded with live
  `web_search`.
- **Content Strategist Agent** — content-gap analysis across the funnel and a
  prioritized, week-by-week content calendar.

Both agents are powered by **Claude (`claude-opus-4-8`)** via the Anthropic SDK,
using adaptive thinking + high effort, structured outputs for the data, and
streaming for long-form drafts. They're grounded in an editable Zerve business
context so output stays on-brand.

## Architecture

```
src/
  lib/
    anthropic.ts        Anthropic client, structured-output + streaming helpers
    zerve-context.ts    Editable company brief injected into every agent
    store.ts            JSON-backed run history (swap for Postgres later)
  agents/
    types.ts            Shared result types
    schemas.ts          JSON schemas for Claude structured outputs
    seo-agent.ts        keywordResearch · contentBrief · draftContent
    content-strategist.ts  analyzeGaps · buildCalendar
  app/
    page.tsx            Dashboard (recent runs + agent cards)
    seo/page.tsx        SEO Agent UI (3 tabs)
    content/page.tsx    Content Strategist UI (2 tabs)
    api/                Route handlers, one per agent action
  components/           Nav + UI primitives
```

The agent logic in `src/agents` is UI-agnostic — it can be reused from a CLI,
a cron job, or a future Slack bot.

## Getting started

```bash
cd zerve-marketing-agents
npm install
cp .env.example .env        # add your ANTHROPIC_API_KEY
npm run dev                 # http://localhost:3000
```

| Command            | Description                         |
| ------------------ | ----------------------------------- |
| `npm run dev`      | Start the dev server                |
| `npm run build`    | Production build                    |
| `npm run typecheck`| Type-check without emitting         |

## Configuration

| Env var               | Default          | Purpose                          |
| --------------------- | ---------------- | -------------------------------- |
| `ANTHROPIC_API_KEY`   | _(required)_     | Powers the agents                |
| `ZERVE_AGENT_MODEL`   | `claude-opus-4-8`| Override the model               |
| `ZERVE_DATA_DIR`      | `./.data`        | Where run history is stored      |

## Tuning the agents

- **Brand voice & facts:** edit `src/lib/zerve-context.ts` — it feeds every
  agent's system prompt.
- **Output shape:** edit the schemas in `src/agents/schemas.ts` and the matching
  types in `src/agents/types.ts`.
- **Behaviour:** edit the system/user prompts in the agent files.

## Roadmap (matching Graphed's surface)

- [ ] **Paid Ads Agent** — monitor Meta/Google campaigns, flag underperformers.
- [ ] **Outreach Agent** — sequence + enrich prospects (Clay is already a likely
      integration point for this team).
- [ ] **Data layer** — connect real sources (GA4, Search Console, Ahrefs) so
      volume/difficulty/rankings are measured, not estimated.
- [ ] **Scheduling** — run agents on a cadence and post results to Slack.
- [ ] **Auth + multi-user** and a Postgres-backed store.

> Note: keyword volume/difficulty and content-gap impact are honest qualitative
> estimates from the model. Wire in a real SEO data source (Search Console /
> Ahrefs / Semrush) to replace estimates with measured numbers.
