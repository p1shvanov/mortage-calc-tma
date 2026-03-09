import { useSignal } from '@telegram-apps/sdk-react';
import { backButton, mainButton } from '@telegram-apps/sdk-react';

/**
 * Returns whether Telegram's native MainButton is available (mounted).
 * When true, use MainButton and hide custom "Рассчитать" / "Изменить параметры" (dev fallback).
 */
export function useMainButtonAvailable(): boolean {
  return useSignal(mainButton.isMounted);
}

/**
 * Returns whether Telegram's native BackButton is available.
 * When true, use BackButton and hide custom "На главную" (dev fallback).
 */
export function useBackButtonAvailable(): boolean {
  return typeof backButton.isSupported === 'function' && backButton.isSupported();
}
