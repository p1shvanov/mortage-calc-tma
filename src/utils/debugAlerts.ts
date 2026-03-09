const DEBUG_STORAGE_KEY = 'mortage_calc_debug';

function isMacOSPlatform(): boolean {
  try {
    if (typeof window === 'undefined') return false;
    const hash = window.location.hash.slice(1);
    const params = new URLSearchParams(hash);
    return params.get('tgWebAppPlatform') === 'macos';
  } catch {
    return false;
  }
}

/**
 * Whether to show alerts on errors.
 * True if: DEV, or platform is macOS (no console there — show errors to user), or localStorage flag / start param.
 */
export function isDebugAlertsEnabled(): boolean {
  if (import.meta.env.DEV) return true;
  if (isMacOSPlatform()) return true;
  try {
    if (typeof localStorage !== 'undefined' && localStorage.getItem(DEBUG_STORAGE_KEY) === '1') {
      return true;
    }
    const hash = typeof window !== 'undefined' ? window.location.hash : '';
    if (hash.includes('platformer_debug')) return true;
    const params = new URLSearchParams(hash.slice(1));
    const startParam = params.get('tgWebAppStartParam') ?? '';
    if (startParam.includes('platformer_debug')) return true;
  } catch {
    // ignore
  }
  return false;
}

/**
 * Enable debug alerts (e.g. from console: window.__mortageCalcDebug = true, then reload).
 * Or set localStorage: localStorage.setItem('mortage_calc_debug', '1')
 */
export function setDebugAlertsEnabled(enabled: boolean): void {
  try {
    if (enabled) {
      localStorage.setItem(DEBUG_STORAGE_KEY, '1');
    } else {
      localStorage.removeItem(DEBUG_STORAGE_KEY);
    }
  } catch {
    // ignore
  }
}
