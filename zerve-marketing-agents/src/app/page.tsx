import Link from "next/link";
import { listRuns, type Run } from "@/lib/store";
import { Stat } from "@/components/ui";

export const dynamic = "force-dynamic";

const kindLabel: Record<Run["kind"], string> = {
  "seo.keywords": "Keyword research",
  "seo.brief": "Content brief",
  "seo.draft": "Content draft",
  "content.gaps": "Gap analysis",
  "content.calendar": "Content calendar",
};

export default async function DashboardPage() {
  const runs = await listRuns(20);
  const seoCount = runs.filter((r) => r.kind.startsWith("seo")).length;
  const contentCount = runs.filter((r) => r.kind.startsWith("content")).length;

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-2xl font-semibold tracking-tight">
          Marketing agents for Zerve
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-muted">
          Autonomous SEO and content-strategy agents grounded in Zerve&apos;s
          business context. Configure a task in plain language and the agent
          researches, reasons, and returns a structured, ready-to-use result.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <Stat label="Total runs" value={runs.length} />
        <Stat label="SEO runs" value={seoCount} />
        <Stat label="Strategy runs" value={contentCount} />
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <Link href="/seo" className="card group transition hover:border-accent">
          <h2 className="text-lg font-semibold">SEO Agent</h2>
          <p className="mt-1 text-sm text-muted">
            Keyword research with funnel mapping, writer-ready content briefs,
            and full Markdown drafts — grounded with live web search.
          </p>
          <span className="mt-3 inline-block text-sm font-medium text-accent group-hover:underline">
            Open SEO Agent →
          </span>
        </Link>
        <Link
          href="/content"
          className="card group transition hover:border-accent2"
        >
          <h2 className="text-lg font-semibold">Content Strategist Agent</h2>
          <p className="mt-1 text-sm text-muted">
            Content-gap analysis across the funnel and a prioritized,
            week-by-week content calendar tuned to your goals.
          </p>
          <span className="mt-3 inline-block text-sm font-medium text-accent2 group-hover:underline">
            Open Content Strategist →
          </span>
        </Link>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
          Recent runs
        </h2>
        {runs.length === 0 ? (
          <div className="card text-sm text-muted">
            No runs yet. Kick one off from the SEO or Content Strategist agent.
          </div>
        ) : (
          <div className="space-y-2">
            {runs.map((r) => (
              <div
                key={r.id}
                className="card flex items-center justify-between py-3"
              >
                <div>
                  <div className="text-sm font-medium">{r.title}</div>
                  <div className="text-xs text-muted">
                    {kindLabel[r.kind]} ·{" "}
                    {new Date(r.createdAt).toLocaleString()}
                  </div>
                </div>
                <span className="badge border-edge text-muted">{r.kind}</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
