import { z } from "zod";
import { draftContent } from "@/agents/seo-agent";
import { saveRun } from "@/lib/store";

export const runtime = "nodejs";
export const maxDuration = 300;

const schema = z.object({
  topic: z.string().min(2),
  format: z.enum(["blog", "landing"]).default("blog"),
  notes: z.string().optional(),
});

/** Streams the draft as plain text chunks, then persists the run when complete. */
export async function POST(req: Request) {
  let body: z.infer<typeof schema>;
  try {
    body = schema.parse(await req.json());
  } catch (err) {
    return new Response(
      err instanceof Error ? err.message : "Invalid request",
      { status: 400 },
    );
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        const full = await draftContent({
          topic: body.topic,
          format: body.format,
          notes: body.notes,
          onDelta: (text) => controller.enqueue(encoder.encode(text)),
        });
        await saveRun({
          kind: "seo.draft",
          title: `${body.format === "landing" ? "Landing page" : "Blog draft"}: ${body.topic}`,
          input: body,
          output: full,
        });
      } catch (err) {
        controller.enqueue(
          encoder.encode(
            `\n\n[Error: ${err instanceof Error ? err.message : "generation failed"}]`,
          ),
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
