import { NextRequest } from "next/server";
import { subscribeToEvents, AppEvent } from "@/lib/db";

export async function GET(req: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection handshake
      const initData = `data: ${JSON.stringify({
        eventType: "connection.connected",
        targetUserId: "ALL",
        payload: { message: "Connected to Fambul Fund real-time event bus" },
        createdAt: new Date().toISOString(),
      })}\n\n`;
      controller.enqueue(encoder.encode(initData));

      // Subscribe to backend event emitter
      const unsubscribe = subscribeToEvents((event: AppEvent) => {
        try {
          const payloadStr = `data: ${JSON.stringify(event)}\n\n`;
          controller.enqueue(encoder.encode(payloadStr));
        } catch (err) {
          console.error("SSE stream enqueue error:", err);
        }
      });

      // Keepalive ping every 15 seconds
      const interval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: ping\n\n`));
        } catch {
          clearInterval(interval);
        }
      }, 15000);

      req.signal.addEventListener("abort", () => {
        clearInterval(interval);
        unsubscribe();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
