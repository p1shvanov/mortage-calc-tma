export interface TelegramPalette {
  /** Primary link/accent color (link_color). */
  link: string;
  /** Accent text color (accent_text_color). */
  accentText: string;
  /** Destructive text color (destructive_text_color). */
  destructiveText: string;
  /** Main background (bg_color). */
  bg: string;
  /** Secondary background (secondary_bg_color). */
  secondaryBg: string;
  /** Section background (section_bg_color). */
  sectionBg: string;
  /** Primary text (text_color). */
  text: string;
  /** Subtitle text (subtitle_text_color). */
  subtitleText: string;
  /** Hint text (hint_color). */
  hint: string;
  /** Button background (button_color). */
  button: string;
  /** Button text (button_text_color). */
  buttonText: string;
}

/**
 * Fallback palette (approximation of Telegram defaults).
 * Used when CSS variables are not available (SSR, tests, etc.).
 */
const FALLBACK_PALETTE: TelegramPalette = {
  link: '#2481cc',
  accentText: '#2481cc',
  destructiveText: '#e53935',
  bg: '#ffffff',
  secondaryBg: '#f5f5f5',
  sectionBg: '#ffffff',
  text: '#000000',
  subtitleText: '#777777',
  hint: '#999999',
  button: '#2481cc',
  buttonText: '#ffffff',
};

function readCssVar(name: string, fallback: string): string {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return fallback;
  }
  try {
    const value = getComputedStyle(document.documentElement).getPropertyValue(
      name,
    );
    return value.trim() || fallback;
  } catch {
    return fallback;
  }
}

/** Read Telegram Mini App theme colors into a structured palette. */
export function getTelegramPalette(): TelegramPalette {
  return {
    link: readCssVar('--tg-theme-link-color', FALLBACK_PALETTE.link),
    accentText: readCssVar(
      '--tg-theme-accent-text-color',
      FALLBACK_PALETTE.accentText,
    ),
    destructiveText: readCssVar(
      '--tg-theme-destructive-text-color',
      FALLBACK_PALETTE.destructiveText,
    ),
    bg: readCssVar('--tg-theme-bg-color', FALLBACK_PALETTE.bg),
    secondaryBg: readCssVar(
      '--tg-theme-secondary-bg-color',
      FALLBACK_PALETTE.secondaryBg,
    ),
    sectionBg: readCssVar(
      '--tg-theme-section-bg-color',
      FALLBACK_PALETTE.sectionBg,
    ),
    text: readCssVar('--tg-theme-text-color', FALLBACK_PALETTE.text),
    subtitleText: readCssVar(
      '--tg-theme-subtitle-text-color',
      FALLBACK_PALETTE.subtitleText,
    ),
    hint: readCssVar('--tg-theme-hint-color', FALLBACK_PALETTE.hint),
    button: readCssVar('--tg-theme-button-color', FALLBACK_PALETTE.button),
    buttonText: readCssVar(
      '--tg-theme-button-text-color',
      FALLBACK_PALETTE.buttonText,
    ),
  };
}

/**
 * Derive chart colors from Telegram palette.
 * Can be reused anywhere; pass explicit palette or use current one.
 */
export function getChartColors(palette: TelegramPalette = getTelegramPalette()) {
  return {
    principal: palette.link,
    principalFill: `${palette.link}33`,
    interest: palette.destructiveText,
    interestFill: `${palette.destructiveText}33`,
    balance: palette.accentText,
    balanceFill: `${palette.accentText}33`,
    extraPayment: palette.button,
    original: palette.destructiveText,
    withEarlyPayments: palette.accentText,
  } as const;
}
