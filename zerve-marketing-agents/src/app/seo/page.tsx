"use client";

import { useState } from "react";
import {
  PageHeader,
  Spinner,
  ErrorNote,
  LevelBadge,
  FunnelBadge,
  Score,
  CopyButton,
} from "@/components/ui";
import type { KeywordResearch, ContentBrief } from "@/agents/types";

type Tab = "keywords" | "brief" | "draft";

export default function SeoPage() {
  const [tab, setTab] = useState<Tab>("keywords");
  return (
    <div>
      <PageHeader
        title="SEO Agent"
        subtitle="Research keywords, generate briefs, and draft content for Zerve."
      />
      <div className="mb-6 flex gap-1">
        {(
          [
            ["keywords", "Keyword research"],
            ["brief", "Content brief"],
            ["draft", "Draft content"],
          ] as [Tab, string][]
        ).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
              tab === key ? "bg-white/10 text-white" : "text-muted hover:text-slate-100"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      {tab === "keywords" && <KeywordsTab />}
      {tab === "brief" && <BriefTab />}
      {tab === "draft" && <DraftTab />}
    </div>
  );
}

function KeywordsTab() {
  const [seed, setSeed] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState<KeywordResearch | null>(null);

  async function run() {
    setLoading(true);
    setError("");
    setData(null);
    try {
      const res = await fetch("/api/seo/keywords", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ seed, notes }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Request failed");
      setData(json.output);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="card space-y-3">
        <div>
          <label className="label">Seed topic or theme</label>
          <input
            className="input"
            placeholder="e.g. serverless compute for data science"
            value={seed}
            onChange={(e) => setSeed(e.target.value)}
          />
        </div>
        <div>
          <label className="label">Notes (optional)</label>
          <textarea
            className="textarea"
            rows={2}
            placeholder="Any angle, audience, or constraint to steer the research"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
        <button className="btn" disabled={loading || seed.length < 2} onClick={run}>
          {loading ? <Spinner /> : null}
          {loading ? "Researching…" : "Run keyword research"}
        </button>
      </div>

      <ErrorNote message={error} />

      {data && (
        <div className="space-y-4">
          <div className="card space-y-2 text-sm text-slate-200">
            <p>{data.summary}</p>
            <p className="text-xs text-muted">
              {data.clusters.some((c) =>
                c.keywords.some((k) => k.searchVolume != null),
              )
                ? "Volume & difficulty are measured (Ahrefs); rank is from Search Console where available."
                : "Volume & difficulty are model estimates. Set AHREFS_API_TOKEN / Search Console env vars for measured data."}
            </p>
          </div>
          {data.clusters.map((cluster, i) => (
            <div key={i} className="card">
              <div className="mb-3">
                <h3 className="text-base font-semibold">{cluster.name}</h3>
                <p className="text-xs text-muted">{cluster.theme}</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-xs uppercase text-muted">
                    <tr>
                      <th className="py-1 pr-3">Keyword</th>
                      <th className="py-1 pr-3">Intent</th>
                      <th className="py-1 pr-3">Funnel</th>
                      <th className="py-1 pr-3">Volume</th>
                      <th className="py-1 pr-3">Difficulty</th>
                      <th className="py-1 pr-3">Rank</th>
                      <th className="py-1">Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cluster.keywords.map((k, j) => (
                      <tr key={j} className="border-t border-edge/60">
                        <td className="py-1.5 pr-3 font-medium">{k.keyword}</td>
                        <td className="py-1.5 pr-3 text-muted">{k.intent}</td>
                        <td className="py-1.5 pr-3">
                          <FunnelBadge value={k.funnelStage} />
                        </td>
                        <td className="py-1.5 pr-3">
                          {k.searchVolume != null ? (
                            <span
                              className="font-medium"
                              title="Measured (Ahrefs)"
                            >
                              {k.searchVolume.toLocaleString()}
                            </span>
                          ) : (
                            <LevelBadge value={k.estVolume} />
                          )}
                        </td>
                        <td className="py-1.5 pr-3">
                          {k.keywordDifficulty != null ? (
                            <span className="font-medium" title="Measured (Ahrefs)">
                              {k.keywordDifficulty}
                            </span>
                          ) : (
                            <LevelBadge value={k.estDifficulty} />
                          )}
                        </td>
                        <td className="py-1.5 pr-3 text-muted">
                          {k.currentPosition != null
                            ? `#${k.currentPosition}`
                            : "—"}
                        </td>
                        <td className="py-1.5">
                          <Score value={k.priorityScore} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function BriefTab() {
  const [keyword, setKeyword] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState<ContentBrief | null>(null);

  async function run() {
    setLoading(true);
    setError("");
    setData(null);
    try {
      const res = await fetch("/api/seo/brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetKeyword: keyword, notes }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Request failed");
      setData(json.output);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="card space-y-3">
        <div>
          <label className="label">Target keyword</label>
          <input
            className="input"
            placeholder="e.g. notebook to production workflow"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
        </div>
        <div>
          <label className="label">Notes (optional)</label>
          <textarea
            className="textarea"
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
        <button
          className="btn"
          disabled={loading || keyword.length < 2}
          onClick={run}
        >
          {loading ? <Spinner /> : null}
          {loading ? "Building brief…" : "Generate brief"}
        </button>
      </div>

      <ErrorNote message={error} />

      {data && (
        <div className="space-y-4">
          <div className="card space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold">
                Brief · {data.targetKeyword}
              </h3>
              <CopyButton text={JSON.stringify(data, null, 2)} />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Search intent" value={data.searchIntent} />
              <Field label="Audience" value={data.audience} />
              <Field label="Target word count" value={String(data.targetWordCount)} />
              <Field label="Meta description" value={data.metaDescription} />
            </div>
            <div>
              <div className="label">Title options</div>
              <ul className="list-disc space-y-1 pl-5 text-sm">
                {data.titleOptions.map((t, i) => (
                  <li key={i}>{t}</li>
                ))}
              </ul>
            </div>
            <div>
              <div className="label">Keywords to include</div>
              <div className="flex flex-wrap gap-1">
                {data.keywordsToInclude.map((k, i) => (
                  <span key={i} className="badge border-edge text-slate-300">
                    {k}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="card">
            <div className="label">Outline</div>
            <div className="space-y-2">
              {data.outline.map((o, i) => (
                <div key={i}>
                  <div
                    className={
                      o.level === "H2"
                        ? "text-sm font-semibold"
                        : "pl-4 text-sm font-medium text-slate-300"
                    }
                  >
                    {o.level === "H3" ? "↳ " : ""}
                    {o.heading}
                  </div>
                  <ul className="list-disc pl-8 text-xs text-muted">
                    {o.points.map((p, j) => (
                      <li key={j}>{p}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="card">
              <div className="label">FAQs</div>
              <div className="space-y-2 text-sm">
                {data.faqs.map((f, i) => (
                  <div key={i}>
                    <div className="font-medium">{f.question}</div>
                    <div className="text-muted">{f.answer}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="card space-y-3">
              <div>
                <div className="label">Internal link ideas</div>
                <ul className="list-disc pl-5 text-sm text-muted">
                  {data.internalLinkIdeas.map((l, i) => (
                    <li key={i}>{l}</li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="label">External references</div>
                <ul className="list-disc pl-5 text-sm text-muted">
                  {data.externalReferenceIdeas.map((l, i) => (
                    <li key={i}>{l}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DraftTab() {
  const [topic, setTopic] = useState("");
  const [format, setFormat] = useState<"blog" | "landing">("blog");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [text, setText] = useState("");

  async function run() {
    setLoading(true);
    setError("");
    setText("");
    try {
      const res = await fetch("/api/seo/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, format, notes }),
      });
      if (!res.ok || !res.body) {
        throw new Error((await res.text()) || "Request failed");
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        setText((prev) => prev + decoder.decode(value, { stream: true }));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="card space-y-3">
        <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
          <div>
            <label className="label">Topic</label>
            <input
              className="input"
              placeholder="e.g. Why notebooks break in production"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
          </div>
          <div>
            <label className="label">Format</label>
            <select
              className="input"
              value={format}
              onChange={(e) => setFormat(e.target.value as "blog" | "landing")}
            >
              <option value="blog">Blog post</option>
              <option value="landing">Landing page</option>
            </select>
          </div>
        </div>
        <div>
          <label className="label">Notes (optional)</label>
          <textarea
            className="textarea"
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
        <button className="btn" disabled={loading || topic.length < 2} onClick={run}>
          {loading ? <Spinner /> : null}
          {loading ? "Drafting…" : "Draft content"}
        </button>
      </div>

      <ErrorNote message={error} />

      {text && (
        <div className="card">
          <div className="mb-2 flex items-center justify-between">
            <div className="label mb-0">Draft (Markdown)</div>
            <CopyButton text={text} />
          </div>
          <pre className="max-h-[60vh] overflow-auto whitespace-pre-wrap font-mono text-sm leading-relaxed text-slate-200">
            {text}
          </pre>
        </div>
      )}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="label">{label}</div>
      <div className="text-sm text-slate-200">{value}</div>
    </div>
  );
}
