/**
 * Pluggable SEO data providers. When configured via env, these replace the
 * model's qualitative volume/difficulty estimates with measured numbers:
 *
 *   - Ahrefs (AHREFS_API_TOKEN): search volume + keyword difficulty.
 *   - Google Search Console (GSC_ACCESS_TOKEN + GSC_SITE_URL): the keywords
 *     your site ALREADY ranks for, with average position — so the agent can
 *     flag "you already rank here" opportunities.
 *
 * Both are best-effort and defensive: any failure degrades silently back to the
 * model estimates rather than breaking a run. Add Semrush/Moz by implementing
 * the same shape.
 */

export interface KeywordMetric {
  keyword: string;
  searchVolume?: number | null;
  keywordDifficulty?: number | null; // 0-100
  currentPosition?: number | null; // avg position if the site ranks
  source: string;
}

export function isSeoDataConfigured(): boolean {
  return Boolean(process.env.AHREFS_API_TOKEN || process.env.GSC_ACCESS_TOKEN);
}

const COUNTRY = process.env.SEO_COUNTRY ?? "us";

/** Ahrefs Keywords Explorer: volume + difficulty for a batch of keywords. */
async function fetchAhrefs(
  keywords: string[],
): Promise<Map<string, KeywordMetric>> {
  const out = new Map<string, KeywordMetric>();
  const token = process.env.AHREFS_API_TOKEN;
  if (!token || keywords.length === 0) return out;

  try {
    const url = new URL(
      "https://api.ahrefs.com/v3/keywords-explorer/overview",
    );
    url.searchParams.set("country", COUNTRY);
    url.searchParams.set("keywords", keywords.join(","));
    url.searchParams.set(
      "select",
      "keyword,volume,difficulty",
    );

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });
    if (!res.ok) return out;
    const json = (await res.json()) as {
      keywords?: Array<Record<string, unknown>>;
    };
    for (const row of json.keywords ?? []) {
      const kw = String(row.keyword ?? "").toLowerCase();
      if (!kw) continue;
      out.set(kw, {
        keyword: kw,
        searchVolume: toNum(row.volume),
        keywordDifficulty: toNum(row.difficulty),
        source: "ahrefs",
      });
    }
  } catch {
    // Degrade silently to estimates.
  }
  return out;
}

/** Google Search Console: existing average position for matching queries. */
async function fetchSearchConsole(
  keywords: string[],
): Promise<Map<string, KeywordMetric>> {
  const out = new Map<string, KeywordMetric>();
  const token = process.env.GSC_ACCESS_TOKEN;
  const site = process.env.GSC_SITE_URL;
  if (!token || !site || keywords.length === 0) return out;

  try {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 90);
    const fmt = (d: Date) => d.toISOString().slice(0, 10);

    const res = await fetch(
      `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(
        site,
      )}/searchAnalytics/query`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          startDate: fmt(start),
          endDate: fmt(end),
          dimensions: ["query"],
          rowLimit: 5000,
        }),
      },
    );
    if (!res.ok) return out;
    const json = (await res.json()) as {
      rows?: Array<{ keys?: string[]; position?: number }>;
    };
    const ranked = new Map<string, number>();
    for (const row of json.rows ?? []) {
      const q = row.keys?.[0]?.toLowerCase();
      if (q && typeof row.position === "number") ranked.set(q, row.position);
    }
    for (const kw of keywords) {
      const pos = ranked.get(kw.toLowerCase());
      if (pos != null) {
        out.set(kw.toLowerCase(), {
          keyword: kw.toLowerCase(),
          currentPosition: Math.round(pos * 10) / 10,
          source: "search-console",
        });
      }
    }
  } catch {
    // Degrade silently.
  }
  return out;
}

function toNum(v: unknown): number | null {
  const n = typeof v === "string" ? Number(v) : (v as number);
  return Number.isFinite(n) ? n : null;
}

/**
 * Fetch measured metrics for a set of keywords from all configured providers,
 * merging Search Console position data onto Ahrefs volume/difficulty.
 */
export async function getKeywordMetrics(
  keywords: string[],
): Promise<Map<string, KeywordMetric>> {
  const unique = Array.from(
    new Set(keywords.map((k) => k.trim().toLowerCase()).filter(Boolean)),
  );
  if (unique.length === 0) return new Map();

  const [ahrefs, gsc] = await Promise.all([
    fetchAhrefs(unique),
    fetchSearchConsole(unique),
  ]);

  const merged = new Map<string, KeywordMetric>(ahrefs);
  for (const [kw, metric] of gsc) {
    const existing = merged.get(kw);
    merged.set(kw, existing ? { ...existing, ...metric, source: `${existing.source}+search-console` } : metric);
  }
  return merged;
}
