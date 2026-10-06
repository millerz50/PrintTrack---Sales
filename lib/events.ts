// lib/events.ts
// In-memory real-time event bus for Server-Sent Events / Live sync

export interface RealtimeEvent {
  type: 'inquiry:created' | 'sale:created' | 'quotation:created' | 'user:updated' | 'user:created' | 'user:deleted' | 'inventory:low';
  payload: any;
  timestamp: string;
}

type EventListener = (event: RealtimeEvent) => void;

// Global listener store for persistent server runtime
const globalStore = globalThis as unknown as {
  __realtimeListeners?: Set<EventListener>;
};

if (!globalStore.__realtimeListeners) {
  globalStore.__realtimeListeners = new Set<EventListener>();
}

export function subscribeToEvents(listener: EventListener) {
  const store = globalStore.__realtimeListeners!;
  store.add(listener);
  return () => {
    store.delete(listener);
  };
}

export function broadcastEvent(type: RealtimeEvent['type'], payload: any) {
  const event: RealtimeEvent = {
    type,
    payload,
    timestamp: new Date().toISOString()
  };

  const store = globalStore.__realtimeListeners;
  if (store) {
    store.forEach(fn => {
      try {
        fn(event);
      } catch (err) {
        console.warn('[RealtimeEvents] Broadcast dispatch error:', err);
      }
    });
  }
}
