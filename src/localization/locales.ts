/**
 * Supported app locales. Add new locale code here and in translations.
 * Locale = language + region; it drives currency, number/date formats, and UI language.
 */
export const SUPPORTED_LOCALES = [
  'en',
  'ru',
  'es',
  'de',
  'fr',
  'pt',
  'zh',
  'it',
  'uk',
  'tr',
] as const;

export type SupportedLanguage = (typeof SUPPORTED_LOCALES)[number];

/** Map Telegram language_code to our locale (first match wins). */
const TELEGRAM_TO_LOCALE: Record<string, SupportedLanguage> = {
  en: 'en',
  ru: 'ru',
  es: 'es',
  de: 'de',
  fr: 'fr',
  pt: 'pt',
  'pt-br': 'pt',
  'pt-BR': 'pt',
  zh: 'zh',
  'zh-hans': 'zh',
  'zh-Hans': 'zh',
  'zh-cn': 'zh',
  it: 'it',
  uk: 'uk',
  tr: 'tr',
};

/**
 * Locale-specific configuration (region-driven).
 * Intl locale for number/date/currency formatting (e.g. en-US, ru-RU, uk-UA).
 */
export const LOCALE_INTL: Record<SupportedLanguage, string> = {
  en: 'en-US',
  ru: 'ru-RU',
  es: 'es-ES',
  de: 'de-DE',
  fr: 'fr-FR',
  pt: 'pt-BR',
  zh: 'zh-CN',
  it: 'it-IT',
  uk: 'uk-UA',
  tr: 'tr-TR',
};

/**
 * Default currency (ISO 4217) for each locale. Matches the region of LOCALE_INTL.
 */
export const LOCALE_CURRENCY: Record<SupportedLanguage, string> = {
  en: 'USD',
  ru: 'RUB',
  es: 'EUR',
  de: 'EUR',
  fr: 'EUR',
  pt: 'BRL',
  zh: 'CNY',
  it: 'EUR',
  uk: 'UAH',
  tr: 'TRY',
};

/** Locales that use comma as decimal separator in form inputs. */
const COMMA_DECIMAL_LOCALES: SupportedLanguage[] = [
  'ru',
  'es',
  'de',
  'fr',
  'pt',
  'it',
  'uk',
  'tr',
];

export function isCommaDecimalLocale(locale: SupportedLanguage): boolean {
  return COMMA_DECIMAL_LOCALES.includes(locale);
}

export function getLocaleFromTelegram(languageCode: string | undefined): SupportedLanguage {
  if (!languageCode) return 'en';
  const lower = languageCode.toLowerCase();
  return TELEGRAM_TO_LOCALE[lower] ?? TELEGRAM_TO_LOCALE[languageCode] ?? 'en';
}
