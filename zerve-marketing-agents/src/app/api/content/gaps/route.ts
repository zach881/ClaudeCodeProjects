import { NextResponse } from "next/server";
import { z } from "zod";
import { analyzeGaps } from "@/agents/content-strategist";
import { saveRun } from "@/lib/store";

export const runtime = "nodejs";
export const maxDuration = 300;

const schema = z.object({
  existingContent: z.array(z.string()).default([]),
  goals: z.string().min(2),
});

export async function POST(req: Request) {
  try {
    const body = schema.parse(await req.json());
    const output = await analyzeGaps(body);
    const run = await saveRun({
      kind: "content.gaps",
      title: `Content gap analysis (${body.existingContent.length} existing)`,
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
