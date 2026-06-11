"use client";

import { useState } from "react";
import {
  PageHeader,
  Spinner,
  ErrorNote,
  LevelBadge,
  FunnelBadge,
  Score,
} from "@/components/ui";
import type { GapAnalysis, ContentCalendar } from "@/agents/types";

type Tab = "gaps" | "calendar";

export default function ContentPage() {
  const [tab, setTab] = useState<Tab>("gaps");
  return (
    <div>
      <PageHeader
        title="Content Strategist Agent"
        subtitle="Find the content gaps that matter and plan what to publish next."
      />
      <div className="mb-6 flex gap-1">
        {(
          [
            ["gaps", "Gap analysis"],
            ["calendar", "Content calendar"],
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
      {tab === "gaps" ? <GapsTab /> : <CalendarTab />}
    </div>
  );
}

function GapsTab() {
  const [existing, setExisting] = useState("");
  const [goals, setGoals] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState<GapAnalysis | null>(null);

  async function run() {
    setLoading(true);
    setError("");
    setData(null);
    try {
      const existingContent = existing
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);
      const res = await fetch("/api/content/gaps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ existingContent, goals }),
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

  const sorted = data
    ? [...data.gaps].sort((a, b) => b.priorityScore - a.priorityScore)
    : [];

  return (
    <div className="space-y-5">
      <div className="card space-y-3">
        <div>
          <label className="label">Existing content (one title per line)</label>
          <textarea
            className="textarea"
            rows={5}
            placeholder={"What is Zerve\nServerless compute for data teams\n…"}
            value={existing}
            onChange={(e) => setExisting(e.target.value)}
          />
        </div>
        <div>
          <label className="label">Business goals for this cycle</label>
          <textarea
            className="textarea"
            rows={3}
            placeholder="e.g. Drive signups from ML engineers; rank for 'notebook to production'; support an enterprise launch"
            value={goals}
            onChange={(e) => setGoals(e.target.value)}
          />
        </div>
        <button className="btn" disabled={loading || goals.length < 2} onClick={run}>
          {loading ? <Spinner /> : null}
          {loading ? "Analyzing…" : "Analyze content gaps"}
        </button>
      </div>

      <ErrorNote message={error} />

      {data && (
        <div className="space-y-4">
          <div className="card space-y-2 text-sm">
            <p className="text-slate-200">{data.summary}</p>
            {data.themes.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-1">
                {data.themes.map((t, i) => (
                  <span key={i} className="badge border-edge text-slate-300">
                    {t}
                  </span>
                ))}
              </div>
            )}
          </div>
          {sorted.map((g, i) => (
            <div key={i} className="card">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold">{g.title}</h3>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs">
                    <FunnelBadge value={g.funnelStage} />
                    <span className="badge border-edge text-slate-300">
                      {g.format}
                    </span>
                    <span className="text-muted">impact</span>
                    <LevelBadge value={g.impact} />
                    <span className="text-muted">effort</span>
                    <LevelBadge value={g.effort} />
                  </div>
                </div>
                <Score value={g.priorityScore} />
              </div>
              <p className="mt-2 text-sm text-muted">{g.rationale}</p>
              {g.targetKeywords.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {g.targetKeywords.map((k, j) => (
                    <span key={j} className="badge border-edge text-slate-300">
                      {k}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CalendarTab() {
  const [weeks, setWeeks] = useState(8);
  const [focus, setFocus] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState<ContentCalendar | null>(null);

  async function run() {
    setLoading(true);
    setError("");
    setData(null);
    try {
      const res = await fetch("/api/content/calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weeks, focus }),
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

  const byWeek = new Map<number, ContentCalendar["items"]>();
  if (data) {
    for (const item of [...data.items].sort((a, b) => a.week - b.week)) {
      const arr = byWeek.get(item.week) ?? [];
      arr.push(item);
      byWeek.set(item.week, arr);
    }
  }

  return (
    <div className="space-y-5">
      <div className="card space-y-3">
        <div className="grid gap-3 sm:grid-cols-[auto_1fr]">
          <div>
            <label className="label">Weeks</label>
            <input
              type="number"
              min={1}
              max={26}
              className="input w-24"
              value={weeks}
              onChange={(e) => setWeeks(Number(e.target.value))}
            />
          </div>
          <div>
            <label className="label">Focus / theme</label>
            <input
              className="input"
              placeholder="e.g. Educate ML engineers on going from prototype to production"
              value={focus}
              onChange={(e) => setFocus(e.target.value)}
            />
          </div>
        </div>
        <button className="btn" disabled={loading || focus.length < 2} onClick={run}>
          {loading ? <Spinner /> : null}
          {loading ? "Planning…" : "Build calendar"}
        </button>
      </div>

      <ErrorNote message={error} />

      {data && (
        <div className="space-y-4">
          <div className="card text-sm text-slate-200">{data.summary}</div>
          {[...byWeek.entries()].map(([week, items]) => (
            <div key={week} className="card">
              <div className="mb-2 text-sm font-semibold text-accent">
                Week {week}
              </div>
              <div className="space-y-2">
                {items.map((item, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-edge/60 p-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-medium">{item.title}</div>
                      <FunnelBadge value={item.funnelStage} />
                    </div>
                    <div className="mt-1 text-xs text-muted">{item.goal}</div>
                    <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs">
                      <span className="badge border-edge text-slate-300">
                        {item.format}
                      </span>
                      <span className="badge border-edge text-slate-300">
                        🔑 {item.primaryKeyword}
                      </span>
                      <span className="badge border-edge text-slate-300">
                        👤 {item.owner}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
