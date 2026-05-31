import type { CrowdingFilter, PriorityFilter } from "@/lib/types";
import { getRealtimeGpsSnapshot } from "@/lib/mock-data";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const day = url.searchParams.get("day") ?? undefined;
  const hour = url.searchParams.get("hour") ?? undefined;
  const crowding = (url.searchParams.get("crowding") as CrowdingFilter | null) ?? undefined;
  const priority = (url.searchParams.get("priority") as PriorityFilter | null) ?? undefined;

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      const send = () => {
        const payload = getRealtimeGpsSnapshot({ day, hour, crowding, priority });
        controller.enqueue(encoder.encode(`event: gps
data: ${JSON.stringify(payload)}

`));
      };

      send();
      const interval = setInterval(send, 3000);
      const heartbeat = setInterval(() => {
        controller.enqueue(encoder.encode(`: heartbeat

`));
      }, 15000);

      const close = () => {
        clearInterval(interval);
        clearInterval(heartbeat);
        try {
          controller.close();
        } catch {}
      };

      request.signal.addEventListener("abort", close);
    }
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no"
    }
  });
}
