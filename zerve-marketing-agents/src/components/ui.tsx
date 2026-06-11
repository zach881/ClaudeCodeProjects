"use client";

import { ReactNode } from "react";
import type { Level, FunnelStage } from "@/agents/types";

export function Spinner() {
  return (
    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
  );
}

export function PageHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-1 text-sm text-muted">{subtitle}</p>
    </div>
  );
}

export function ErrorNote({ message }: { message: string }) {
  if (!message) return null;
  return (
    <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
      {message}
    </div>
  );
}

const levelColor: Record<Level, string> = {
  low: "border-slate-500/40 text-slate-300",
  medium: "border-amber-400/40 text-amber-200",
  high: "border-emerald-400/40 text-emerald-200",
};
export function LevelBadge({ value }: { value: Level }) {
  return <span className={`badge ${levelColor[value]}`}>{value}</span>;
}

const funnelColor: Record<FunnelStage, string> = {
  TOFU: "border-sky-400/40 text-sky-200",
  MOFU: "border-violet-400/40 text-violet-200",
  BOFU: "border-emerald-400/40 text-emerald-200",
};
export function FunnelBadge({ value }: { value: FunnelStage }) {
  return <span className={`badge ${funnelColor[value]}`}>{value}</span>;
}

export function Score({ value }: { value: number }) {
  const hue = Math.round((Math.min(100, Math.max(0, value)) / 100) * 130);
  return (
    <span
      className="badge border-transparent font-semibold"
      style={{
        background: `hsl(${hue} 70% 18%)`,
        color: `hsl(${hue} 80% 75%)`,
      }}
      title="Priority score (1-100)"
    >
      {value}
    </span>
  );
}

export function Stat({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="card flex flex-col gap-1">
      <span className="text-xs uppercase tracking-wide text-muted">{label}</span>
      <span className="text-2xl font-semibold">{value}</span>
    </div>
  );
}

export function CopyButton({ text }: { text: string }) {
  return (
    <button
      type="button"
      className="btn-ghost text-xs"
      onClick={() => navigator.clipboard?.writeText(text)}
    >
      Copy
    </button>
  );
}
