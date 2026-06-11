import { NextResponse } from "next/server";
import { z } from "zod";
import { keywordResearch } from "@/agents/seo-agent";
import { saveRun } from "@/lib/store";

export const runtime = "nodejs";
export const maxDuration = 300;

const schema = z.object({
  seed: z.string().min(2),
  notes: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = schema.parse(await req.json());
    const output = await keywordResearch(body);
    const run = await saveRun({
      kind: "seo.keywords",
      title: `Keyword research: ${body.seed}`,
      input: body,
      output,
    });
    return NextResponse.json({ run, output });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 400 },
    );
  }
}
