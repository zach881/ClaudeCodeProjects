import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";

/**
 * Minimal append-only JSON run store. Every agent execution is persisted as a
 * "run" so the dashboard can show history — the same role Graphed's warehouse
 * plays, scoped down to an internal MVP. Swap this module for Postgres/Prisma
 * later without touching the agents.
 */

export type AgentKind =
  | "seo.keywords"
  | "seo.brief"
  | "seo.draft"
  | "content.gaps"
  | "content.calendar"
  | "outreach.enrich"
  | "outreach.sequence";

export interface Run {
  id: string;
  kind: AgentKind;
  title: string;
  input: unknown;
  output: unknown;
  createdAt: string;
}

const DATA_DIR = process.env.ZERVE_DATA_DIR
  ? path.resolve(process.env.ZERVE_DATA_DIR)
  : path.join(process.cwd(), ".data");
const RUNS_FILE = path.join(DATA_DIR, "runs.json");

async function readAll(): Promise<Run[]> {
  try {
    const raw = await fs.readFile(RUNS_FILE, "utf8");
    return JSON.parse(raw) as Run[];
  } catch {
    return [];
  }
}

async function writeAll(runs: Run[]): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(RUNS_FILE, JSON.stringify(runs, null, 2), "utf8");
}

export async function saveRun(
  run: Omit<Run, "id" | "createdAt">,
): Promise<Run> {
  const full: Run = {
    ...run,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  const runs = await readAll();
  runs.unshift(full);
  // Keep the store bounded for an internal tool.
  await writeAll(runs.slice(0, 500));
  return full;
}

export async function listRuns(limit = 50): Promise<Run[]> {
  const runs = await readAll();
  return runs.slice(0, limit);
}

export async function getRun(id: string): Promise<Run | undefined> {
  const runs = await readAll();
  return runs.find((r) => r.id === id);
}
