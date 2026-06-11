"use client";

import { useState } from "react";
import {
  PageHeader,
  Spinner,
  ErrorNote,
  CopyButton,
} from "@/components/ui";
import type { EnrichmentResult, OutreachSequence } from "@/agents/types";

type Tab = "enrich" | "sequence";

export default function OutreachPage() {
  const [tab, setTab] = useState<Tab>("enrich");
  return (
    <div>
      <PageHeader
        title="Outreach Agent"
        subtitle="Enrich target accounts with Clay and draft personalized sequences."
      />
      <div className="mb-6 flex gap-1">
        {(
          [
            ["enrich", "Find & enrich"],
            ["sequence", "Draft sequence"],
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
      {tab === "enrich" ? <EnrichTab /> : <SequenceTab />}
    </div>
  );
}

function EnrichTab() {
  const [domain, setDomain] = useState("");
  const [roles, setRoles] = useState("");
  const [names, setNames] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState<EnrichmentResult | null>(null);

  async function run() {
    setLoading(true);
    setError("");
    setData(null);
    try {
      const res = await fetch("/api/outreach/enrich", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyDomain: domain,
          roleKeywords: split(roles),
          contactNames: split(names),
        }),
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
          <label className="label">Company domain</label>
          <input
            className="input"
            placeholder="e.g. stripe.com"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="label">Target roles (comma-separated)</label>
            <input
              className="input"
              placeholder="Head of Data Science, ML Engineer"
              value={roles}
              onChange={(e) => setRoles(e.target.value)}
            />
          </div>
          <div>
            <label className="label">Named contacts (optional)</label>
            <input
              className="input"
              placeholder="Jane Doe, John Smith"
              value={names}
              onChange={(e) => setNames(e.target.value)}
            />
          </div>
        </div>
        <button className="btn" disabled={loading || domain.length < 3} onClick={run}>
          {loading ? <Spinner /> : null}
          {loading ? "Enriching…" : "Find & enrich"}
        </button>
      </div>

      <ErrorNote message={error} />

      {data && (
        <div className="space-y-4">
          <div className="card space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold">
                {data.company.name || data.company.domain}
              </h3>
              <span className="badge border-edge text-muted">
                source: {data.source}
              </span>
            </div>
            <p className="text-sm text-slate-200">{data.company.description}</p>
            <div className="flex flex-wrap gap-1 text-xs">
              {data.company.industry && (
                <span className="badge border-edge text-slate-300">
                  {data.company.industry}
                </span>
              )}
              {data.company.headcount && (
                <span className="badge border-edge text-slate-300">
                  {data.company.headcount}
                </span>
              )}
              {data.company.techStack?.map((t, i) => (
                <span key={i} className="badge border-edge text-slate-300">
                  {t}
                </span>
              ))}
            </div>
            {data.company.recentSignals?.length > 0 && (
              <ul className="list-disc pl-5 text-xs text-muted">
                {data.company.recentSignals.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            )}
            <div className="rounded-xl border border-edge/60 bg-ink/40 p-3 text-sm">
              <span className="label">ICP fit</span>
              {data.fit}
            </div>
          </div>

          {data.contacts.map((c, i) => (
            <div key={i} className="card">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-semibold">
                    {c.name}{" "}
                    <span className="font-normal text-muted">· {c.title}</span>
                  </div>
                  <div className="text-xs text-muted">
                    {[c.seniority, c.location].filter(Boolean).join(" · ")}
                  </div>
                </div>
                <div className="flex gap-2 text-xs">
                  {c.email && (
                    <span className="badge border-emerald-400/40 text-emerald-200">
                      {c.email}
                    </span>
                  )}
                  {c.linkedinUrl && (
                    <a
                      className="badge border-sky-400/40 text-sky-200"
                      href={c.linkedinUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      LinkedIn
                    </a>
                  )}
                </div>
              </div>
              <p className="mt-2 text-sm text-muted">{c.relevanceToZerve}</p>
              {c.personalizationHooks?.length > 0 && (
                <ul className="mt-2 list-disc pl-5 text-xs text-slate-300">
                  {c.personalizationHooks.map((h, j) => (
                    <li key={j}>{h}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SequenceTab() {
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [context, setContext] = useState("");
  const [goal, setGoal] = useState("");
  const [channel, setChannel] = useState<"email" | "linkedin" | "multi">("email");
  const [steps, setSteps] = useState(4);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState<OutreachSequence | null>(null);

  async function run() {
    setLoading(true);
    setError("");
    setData(null);
    try {
      const res = await fetch("/api/outreach/sequence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prospectName: name,
          prospectCompany: company,
          prospectContext: context,
          campaignGoal: goal,
          channel,
          steps,
        }),
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
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="label">Prospect name</label>
            <input
              className="input"
              placeholder="Jane Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="label">Company</label>
            <input
              className="input"
              placeholder="Acme Inc"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            />
          </div>
        </div>
        <div>
          <label className="label">
            Prospect context (paste enrichment, role, signals)
          </label>
          <textarea
            className="textarea"
            rows={3}
            placeholder="Head of ML Platform; team of 12; hiring ML engineers; uses Databricks + Airflow…"
            value={context}
            onChange={(e) => setContext(e.target.value)}
          />
        </div>
        <div>
          <label className="label">Campaign goal</label>
          <input
            className="input"
            placeholder="Book a 20-min intro call"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="label">Channel</label>
            <select
              className="input"
              value={channel}
              onChange={(e) =>
                setChannel(e.target.value as "email" | "linkedin" | "multi")
              }
            >
              <option value="email">Email</option>
              <option value="linkedin">LinkedIn</option>
              <option value="multi">Multi-channel</option>
            </select>
          </div>
          <div>
            <label className="label">Steps</label>
            <input
              type="number"
              min={1}
              max={8}
              className="input"
              value={steps}
              onChange={(e) => setSteps(Number(e.target.value))}
            />
          </div>
        </div>
        <button
          className="btn"
          disabled={loading || name.length < 1 || goal.length < 2}
          onClick={run}
        >
          {loading ? <Spinner /> : null}
          {loading ? "Writing…" : "Draft sequence"}
        </button>
      </div>

      <ErrorNote message={error} />

      {data && (
        <div className="space-y-4">
          <div className="card text-sm text-slate-200">{data.summary}</div>
          {data.steps
            .slice()
            .sort((a, b) => a.dayOffset - b.dayOffset)
            .map((s, i) => (
              <div key={i} className="card">
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="badge border-accent/50 text-accent">
                      Step {s.step}
                    </span>
                    <span className="badge border-edge text-slate-300">
                      {s.channel}
                    </span>
                    <span className="text-xs text-muted">day {s.dayOffset}</span>
                  </div>
                  <CopyButton text={`${s.subject ? s.subject + "\n\n" : ""}${s.body}`} />
                </div>
                {s.subject && (
                  <div className="text-sm font-semibold">{s.subject}</div>
                )}
                <pre className="mt-1 whitespace-pre-wrap font-sans text-sm text-slate-200">
                  {s.body}
                </pre>
                <div className="mt-2 text-xs italic text-muted">
                  {s.rationale}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

function split(s: string): string[] {
  return s
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
}
