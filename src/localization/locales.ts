/**
 * Supported app locales. Add new locale code here and in translations.
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

/** Intl locale for number/date formatting (e.g. de-DE, zh-CN). */
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
