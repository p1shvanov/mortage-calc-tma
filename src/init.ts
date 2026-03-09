import {
  setDebug,
  restoreInitData,
  init as initSDK,
  bindThemeParamsCssVars,
  bindViewportCssVars,
  bindMiniAppCssVars,
  miniApp,
  viewport,
  themeParams,
  enableClosingConfirmation,
  swipeBehavior,
  closingBehavior,
  backButton,
  mainButton,
  settingsButton,
  retrieveLaunchParams,
  mockTelegramEnv,
  emitEvent,
  type ThemeParams,
} from '@telegram-apps/sdk-react';

/**
 * Sets Mini App background to theme's secondary color so the app blends with Telegram UI.
 */
function setBackgroundAsSecondary(): void {
  if (!miniApp.setBackgroundColor?.isAvailable?.()) return;
  const theme = retrieveLaunchParams().tgWebAppThemeParams;
  const color = theme?.secondary_bg_color;
  if (color) miniApp.setBackgroundColor(color);
}

export type InitOptions = {
  /** Enable SDK debug logs. */
  debug?: boolean;
  /** Load Eruda dev tools (e.g. for iOS/Android/macOS). */
  eruda?: boolean;
  /** Mock Telegram env for macOS client bugs (theme/safe_area, viewport timeout). */
  mockForMacOS?: boolean;
};

/**
 * Initializes the application and configures its dependencies.
 * Follows Telegram Mini Apps best practices: init SDK first, then mount only
 * the components that are used; check isSupported() before mounting.
 * @see https://docs.telegram-mini-apps.com/packages/tma-js-sdk/usage-tips
 */
export async function init(options: InitOptions = {}): Promise<void> {
  const { debug = false, eruda = false, mockForMacOS = false } = options;

  setDebug(debug);
  initSDK();

  if (eruda) {
    void import('eruda').then(({ default: eruda }) => {
      eruda.init();
      eruda.position({ x: window.innerWidth - 50, y: 0 });
    });
  }

  // Telegram for macOS has known bugs: client may not respond to web_app_request_theme
  // and emits incorrect web_app_request_safe_area. Mock these and add viewport timeout.
  if (mockForMacOS) {
    let firstThemeSent = false;
    mockTelegramEnv({
      onEvent(event, next) {
        if (event[0] === 'web_app_request_theme') {
          let tp: ThemeParams = {};
          if (firstThemeSent) {
            tp = themeParams.state();
          } else {
            firstThemeSent = true;
            tp = retrieveLaunchParams().tgWebAppThemeParams ?? tp;
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

  restoreInitData();
  miniApp.mountSync();
  setBackgroundAsSecondary();

  const viewportMountResult: Promise<{ mounted: boolean }> = mockForMacOS
    ? Promise.race([
        viewport.mount().then(() => ({ mounted: true })),
        new Promise<{ mounted: boolean }>((resolve) =>
          setTimeout(() => resolve({ mounted: false }), 2000),
        ),
      ])
    : viewport.mount().then(() => ({ mounted: true }));

  const { mounted: viewportMounted } = await viewportMountResult;

  if (backButton.isSupported()) backButton.mount();
  if (mainButton.mount.isAvailable()) mainButton.mount();
  if (settingsButton.mount.isAvailable()) {
    settingsButton.mount();
    if (settingsButton.show.isAvailable()) settingsButton.show();
  }
  if (viewportMounted) bindViewportCssVars();
  bindMiniAppCssVars();
  bindThemeParamsCssVars();
  swipeBehavior.mount();
  swipeBehavior.disableVertical();
  closingBehavior.mount();
  closingBehavior.enableConfirmation();
  enableClosingConfirmation();
}
