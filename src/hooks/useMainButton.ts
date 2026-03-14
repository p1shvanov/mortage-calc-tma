import { useEffect, useRef } from 'react';
import { mainButton } from '@telegram-apps/sdk-react';

import { hapticButton } from '@/utils/haptic';

export interface UseMainButtonOptions {
  /** Button label */
  text: string;
  /** Whether the button is clickable */
  isEnabled?: boolean;
  /** Called when user taps the main button */
  onClick: () => void;
  /** Show the button (default true when options are provided) */
  isVisible?: boolean;
  /** Shine effect (default false) */
  hasShineEffect?: boolean;
  /** Show loading spinner on the button */
  isLoading?: boolean;
}

/**
 * Binds Telegram Main Button to the given text, enabled state and click handler.
 * Обёртка над Telegram MainButton:
 * - на маунте обновляет текст/состояние и вешает обработчик;
 * - на анмаунте снимает обработчик и скрывает кнопку.
 * Если options === null, хук ничего не делает — предыдущая конфигурация
 * должна быть очищена владельцем, который её устанавливал.
 */
export function useMainButton(options: UseMainButtonOptions | null) {
  const onClickRef = useRef(options?.onClick);
  onClickRef.current = options?.onClick;

  useEffect(() => {
    if (!options) return;

    const {
      text,
      isEnabled = true,
      isVisible = true,
      hasShineEffect = false,
      isLoading = false,
    } = options;

    mainButton.setParams({
      text,
      isVisible,
      isEnabled,
      hasShineEffect,
      isLoaderVisible: isLoading,
    });

    const off = mainButton.onClick(() => {
      hapticButton();
      onClickRef.current?.();
    });

    return () => {
      mainButton.setParams({ isVisible: false, isLoaderVisible: false });
      off();
    };
  }, [
    options?.text,
    options?.isEnabled,
    options?.isVisible,
    options?.hasShineEffect,
    options?.isLoading,
  ]);

  useEffect(() => {
    if (!options) return;
    mainButton.setParams({ isEnabled: options.isEnabled ?? true });
  }, [options?.isEnabled]);
}
