import { NextResponse } from "next/server";
import { z } from "zod";
import { buildCalendar } from "@/agents/content-strategist";
import { saveRun } from "@/lib/store";

export const runtime = "nodejs";
export const maxDuration = 300;

const schema = z.object({
  weeks: z.number().int().min(1).max(26).default(8),
  focus: z.string().min(2),
});

export async function POST(req: Request) {
  try {
    const body = schema.parse(await req.json());
    const output = await buildCalendar(body);
    const run = await saveRun({
      kind: "content.calendar",
      title: `${body.weeks}-week calendar: ${body.focus}`,
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
