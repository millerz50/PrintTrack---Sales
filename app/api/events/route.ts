import { NextRequest } from 'next/server';
import { subscribeToEvents, RealtimeEvent } from '@/lib/events';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // Send initial heartbeat
      const initial = `data: ${JSON.stringify({ type: 'connected', timestamp: new Date().toISOString() })}\n\n`;
      controller.enqueue(encoder.encode(initial));

      // Subscribe to real-time events bus
      const unsubscribe = subscribeToEvents((event: RealtimeEvent) => {
        try {
          const chunk = `data: ${JSON.stringify(event)}\n\n`;
          controller.enqueue(encoder.encode(chunk));
        } catch {
          // stream might be closed
        }
      });

      // Keepalive ping every 25 seconds
      const interval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: ping\n\n`));
        } catch {
          clearInterval(interval);
          unsubscribe();
        }
      }, 25000);

      req.signal.addEventListener('abort', () => {
        clearInterval(interval);
        unsubscribe();
        try {
          controller.close();
        } catch {
          // ignore
        }
      });
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no'
    }
  });
}
