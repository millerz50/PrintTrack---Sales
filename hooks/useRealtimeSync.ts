'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { RealtimeEvent } from '@/lib/events';
import { sendBrowserNotification } from '@/lib/notifications';

interface UseRealtimeSyncOptions {
  onEvent?: (event: RealtimeEvent) => void;
  onRefresh?: () => void;
  enableChime?: boolean;
}

export function useRealtimeSync(options: UseRealtimeSyncOptions = {}) {
  const { onEvent, onRefresh, enableChime = true } = options;
  const [isConnected, setIsConnected] = useState(false);
  const [latestEvent, setLatestEvent] = useState<RealtimeEvent | null>(null);
  const [liveAlert, setLiveAlert] = useState<string | null>(null);

  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;

  const onRefreshRef = useRef(onRefresh);
  onRefreshRef.current = onRefresh;

  // Gentle synthesized Web Audio chime (safe, no external sound file dependency)
  const playChime = useCallback(() => {
    if (!enableChime || typeof window === 'undefined') return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch {
      // Audio might be blocked until user gesture
    }
  }, [enableChime]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let eventSource: EventSource | null = null;
    let reconnectTimeout: any = null;

    const connect = () => {
      try {
        eventSource = new EventSource('/api/events');

        eventSource.onopen = () => {
          setIsConnected(true);
        };

        eventSource.onmessage = (e) => {
          try {
            const data: RealtimeEvent = JSON.parse(e.data);
            if (!data || !data.type) return;

            setLatestEvent(data);

            if (data.type === 'inquiry:created' || data.type === 'quotation:created') {
              const customerName = data.payload?.customerName || 'A new client';
              const alertMsg = `🔔 New Commercial Quote Request from ${customerName}`;
              setLiveAlert(alertMsg);
              playChime();
              sendBrowserNotification(alertMsg, {
                body: `Total: $${data.payload?.totalAmount || '0.00'} • Check Quotations tab in POS`,
                type: 'info'
              });
              if (onRefreshRef.current) onRefreshRef.current();
            } else if (data.type === 'sale:created') {
              const alertMsg = `🧾 New Sale: Receipt #${data.payload?.receiptNumber || 'POS'}`;
              setLiveAlert(alertMsg);
              if (onRefreshRef.current) onRefreshRef.current();
            } else if (data.type === 'user:created' || data.type === 'user:updated') {
              if (onRefreshRef.current) onRefreshRef.current();
            }

            if (onEventRef.current) {
              onEventRef.current(data);
            }

            // Auto-hide live alert banner after 6 seconds
            setTimeout(() => {
              setLiveAlert(null);
            }, 6000);
          } catch {
            // keepalive ping or JSON parse
          }
        };

        eventSource.onerror = () => {
          setIsConnected(false);
          if (eventSource) {
            eventSource.close();
            eventSource = null;
          }
          // Reconnect with backoff
          reconnectTimeout = setTimeout(connect, 5000);
        };
      } catch (err) {
        setIsConnected(false);
      }
    };

    connect();

    return () => {
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [playChime]);

  return {
    isConnected,
    latestEvent,
    liveAlert,
    clearAlert: () => setLiveAlert(null),
  };
}
