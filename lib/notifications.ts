// lib/notifications.ts
'use client';

export type NotificationPermissionState = 'default' | 'granted' | 'denied' | 'unsupported';

export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export function getNotificationPermission(): NotificationPermissionState {
  if (!isNotificationSupported()) return 'unsupported';
  return Notification.permission as NotificationPermissionState;
}

export async function requestNotificationPermission(): Promise<NotificationPermissionState> {
  if (!isNotificationSupported()) return 'unsupported';
  try {
    const permission = await Notification.requestPermission();
    return permission as NotificationPermissionState;
  } catch (err) {
    console.warn('[Notifications] Error requesting permission:', err);
    return 'denied';
  }
}

// Gentle audio chime for POS feedback
function playChime(type: 'success' | 'alert' | 'info' = 'success') {
  if (typeof window === 'undefined') return;
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    if (type === 'success') {
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.12); // A5
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.start(now);
      osc.stop(now + 0.35);
    } else if (type === 'alert') {
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(440, now + 0.18);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.start(now);
      osc.stop(now + 0.35);
    } else {
      osc.frequency.setValueAtTime(523.25, now); // C5
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.start(now);
      osc.stop(now + 0.25);
    }
  } catch {
    // AudioContext blocked or not allowed until interaction
  }
}

export interface AppNotificationOptions {
  body?: string;
  icon?: string;
  tag?: string;
  type?: 'success' | 'alert' | 'info';
}

export function sendBrowserNotification(
  title: string,
  options: AppNotificationOptions = {}
): boolean {
  if (typeof window === 'undefined') return false;

  const { body, icon = '/IMG-20260907-WA0015.jpg', tag, type = 'info' } = options;

  // Always play audio chime for immediate auditory feedback
  playChime(type);

  if (!isNotificationSupported()) {
    return false;
  }

  if (Notification.permission === 'granted') {
    try {
      const n = new Notification(title, {
        body,
        icon,
        tag: tag || `mibs-${Date.now()}`
      });

      // Auto close after 6 seconds
      setTimeout(() => {
        try {
          n.close();
        } catch {}
      }, 6000);

      return true;
    } catch (err) {
      console.warn('[Notifications] Could not display system notification:', err);
      return false;
    }
  }

  return false;
}
