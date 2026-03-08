/**
 * Haptic feedback helper. Uses Telegram Mini Apps haptic API when available.
 * No-op when unsupported or outside TMA (e.g. in browser dev).
 */

import { hapticFeedback } from '@telegram-apps/sdk-react';

export type ImpactStyle = 'light' | 'medium' | 'heavy' | 'rigid' | 'soft';
export type NotificationType = 'error' | 'success' | 'warning';

function safe(callback: () => void): void {
  try {
    const supported =
      typeof (hapticFeedback as { isSupported?: () => boolean }).isSupported === 'function'
        ? (hapticFeedback as { isSupported: () => boolean }).isSupported()
        : true;
    if (!supported) return;
    callback();
  } catch {
    // ignore when SDK not ready or not in TMA
  }
}

export function hapticImpact(style: ImpactStyle = 'light'): void {
  safe(() => hapticFeedback.impactOccurred(style));
}

export function hapticNotification(type: NotificationType = 'success'): void {
  safe(() => hapticFeedback.notificationOccurred(type));
}

export function hapticSelection(): void {
  safe(() => hapticFeedback.selectionChanged());
}
