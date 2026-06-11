import { NextResponse } from "next/server";
import { z } from "zod";
import { enrichTarget } from "@/agents/outreach-agent";
import { saveRun } from "@/lib/store";

export const runtime = "nodejs";
export const maxDuration = 300;

const schema = z.object({
  companyDomain: z.string().min(3),
  roleKeywords: z.array(z.string()).optional(),
  contactNames: z.array(z.string()).optional(),
});

export async function POST(req: Request) {
  try {
    const body = schema.parse(await req.json());
    const output = await enrichTarget(body);
    const run = await saveRun({
      kind: "outreach.enrich",
      title: `Enrich: ${body.companyDomain}`,
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
