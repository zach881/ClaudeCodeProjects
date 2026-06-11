import { NextResponse } from "next/server";
import { z } from "zod";
import { draftSequence } from "@/agents/outreach-agent";
import { saveRun } from "@/lib/store";

export const runtime = "nodejs";
export const maxDuration = 300;

const schema = z.object({
  prospectName: z.string().min(1),
  prospectCompany: z.string().min(1),
  prospectContext: z.string().default(""),
  campaignGoal: z.string().min(2),
  channel: z.enum(["email", "linkedin", "multi"]).default("email"),
  steps: z.number().int().min(1).max(8).default(4),
});

export async function POST(req: Request) {
  try {
    const body = schema.parse(await req.json());
    const output = await draftSequence(body);
    const run = await saveRun({
      kind: "outreach.sequence",
      title: `Sequence: ${body.prospectName} @ ${body.prospectCompany}`,
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
