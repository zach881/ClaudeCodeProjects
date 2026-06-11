import { NextResponse } from "next/server";
import { z } from "zod";
import { contentBrief } from "@/agents/seo-agent";
import { saveRun } from "@/lib/store";

export const runtime = "nodejs";
export const maxDuration = 300;

const schema = z.object({
  targetKeyword: z.string().min(2),
  notes: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = schema.parse(await req.json());
    const output = await contentBrief(body);
    const run = await saveRun({
      kind: "seo.brief",
      title: `Content brief: ${body.targetKeyword}`,
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
