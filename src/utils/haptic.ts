/**
 * Centralized haptic feedback for user actions.
 * Uses Telegram Mini Apps haptic API when available; no-op otherwise.
 * @see https://docs.telegram-mini-apps.com/platform/haptic-feedback
 */

import { hapticFeedback } from '@telegram-apps/sdk-react';

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

/**
 * Button tap, primary action (e.g. "Calculate", "Save", "Next").
 * Use for: main buttons, placeholder actions, submit.
 */
export function hapticButton(): void {
  safe(() => hapticFeedback.impactOccurred('light'));
}

/**
 * Selection change: list item tap, cell tap, opening item, toggle.
 * Use for: list/cell click, tab change, opening calculation, FAQ.
 */
export function hapticSelection(): void {
  safe(() => hapticFeedback.selectionChanged());
}

/**
 * Task completed successfully (e.g. saved, added, removed).
 * Use after: successful save, add item, delete, form submit success.
 */
export function hapticSuccess(): void {
  safe(() => hapticFeedback.notificationOccurred('success'));
}

/**
 * Task failed (e.g. save error, load error).
 * Use after: failed API call, validation error.
 */
export function hapticError(): void {
  safe(() => hapticFeedback.notificationOccurred('error'));
}

/**
 * Warning (e.g. destructive action confirmation).
 * Use for: warning state, optional confirmation.
 */
export function hapticWarning(): void {
  safe(() => hapticFeedback.notificationOccurred('warning'));
}

/**
 * Destructive action (e.g. delete button press).
 * Use for: delete, remove, cancel that has impact.
 */
export function hapticDestructive(): void {
  safe(() => hapticFeedback.impactOccurred('medium'));
}

/** Single export object for convenience: haptic.button(), haptic.selection(), etc. */
export const haptic = {
  button: hapticButton,
  selection: hapticSelection,
  success: hapticSuccess,
  error: hapticError,
  warning: hapticWarning,
  destructive: hapticDestructive,
};
