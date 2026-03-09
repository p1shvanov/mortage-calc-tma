import {
  setDebug,
  restoreInitData,
  init as initSDK,
  bindThemeParamsCssVars,
  bindViewportCssVars,
  mockTelegramEnv,
  type ThemeParams,
  themeParamsState,
  retrieveLaunchParams,
  emitEvent,
  bindMiniAppCssVars,
  miniApp,
  viewport,
  enableClosingConfirmation,
  swipeBehavior,
  closingBehavior,
  backButton,
  // mainButton,
} from '@telegram-apps/sdk-react';

/**
 * Initializes the application and configures its dependencies.
 * Follows Telegram Mini Apps best practices: init SDK first, then mount only
 * the components that are used; check isSupported() before mounting.
 * @see https://docs.telegram-mini-apps.com/packages/tma-js-sdk/usage-tips
 */
export async function init(options: {
  debug: boolean;
  eruda: boolean;
  mockForMacOS: boolean;
}): Promise<void> {
  // 1. Initialize the SDK first (no side effects until init is called).
  setDebug(options.debug);
  initSDK();

  // Add Eruda if needed.
  options.eruda && void import('eruda').then(({ default: eruda }) => {
    eruda.init();
    eruda.position({ x: window.innerWidth - 50, y: 0 });
  });

  // Telegram for macOS has a ton of bugs, including cases, when the client doesn't
  // even response to the "web_app_request_theme" method. It also generates an incorrect
  // event for the "web_app_request_safe_area" method.
  if (options.mockForMacOS) {
    let firstThemeSent = false;
    mockTelegramEnv({
      onEvent(event, next) {
        if (event[0] === 'web_app_request_theme') {
          let tp: ThemeParams = {};
          if (firstThemeSent) {
            tp = themeParamsState();
          } else {
            firstThemeSent = true;
            tp ||= retrieveLaunchParams().tgWebAppThemeParams;
          }
          return emitEvent('theme_changed', { theme_params: tp });
        }

        if (event[0] === 'web_app_request_safe_area') {
          return emitEvent('safe_area_changed', { left: 0, top: 0, right: 0, bottom: 0 });
        }

        next();
      },
    });
  }

  // 2. Mount only the components used in the app (required before calling their methods).
  restoreInitData();
  miniApp.mountSync();

  // На десктопе (macOS) viewport.mount() может зависнуть: клиент не отвечает на запрос.
  // Не ждём бесконечно — через таймаут продолжаем инициализацию. Если сработал таймаут,
  // viewport не смонтирован — не вызываем bindViewportCssVars(), иначе будет ошибка "component is unmounted".
  const viewportMountResult: Promise<{ mounted: boolean }> = options.mockForMacOS
    ? Promise.race([
        viewport.mount().then(() => ({ mounted: true })),
        new Promise<{ mounted: boolean }>((resolve) =>
          setTimeout(() => resolve({ mounted: false }), 2000),
        ),
      ])
    : viewport.mount().then(() => ({ mounted: true }));

  const { mounted: viewportMounted } = await viewportMountResult;

  if (backButton.isSupported()) backButton.mount();
  if (viewportMounted) {
    bindViewportCssVars();
  }
  bindMiniAppCssVars();
  bindThemeParamsCssVars();
  swipeBehavior.mount();
  swipeBehavior.disableVertical();
  closingBehavior.mount();
  closingBehavior.enableConfirmation();
  enableClosingConfirmation();
}