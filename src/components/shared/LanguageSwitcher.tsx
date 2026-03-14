import { memo } from 'react';
import { Cell, Checkbox, Text } from '@telegram-apps/telegram-ui';
import { useLocalization } from '@/providers/LocalizationProvider';
import { hapticSelection } from '@/utils/haptic';
import type { SupportedLanguage } from '@/providers/LocalizationProvider';
import { SUPPORTED_LOCALES } from '@/localization/locales';

const LANGUAGE_LABEL_KEYS: Record<SupportedLanguage, string> = {
  en: 'languageEnglish',
  ru: 'languageRussian',
  es: 'languageSpanish',
  de: 'languageGerman',
  fr: 'languageFrench',
  pt: 'languagePortuguese',
  zh: 'languageChinese',
  it: 'languageItalian',
  uk: 'languageUkrainian',
  tr: 'languageTurkish',
};

export const LANGUAGES = SUPPORTED_LOCALES.map((value) => ({
  value,
  labelKey: LANGUAGE_LABEL_KEYS[value],
}));

const LanguageSwitcher = memo(function LanguageSwitcher() {
  const { language, setLanguage, t } = useLocalization();

  return (
    <>
      {LANGUAGES.map(({ value, labelKey }) => (
        <Cell
          key={value}
          after={language === value ? <Checkbox checked disabled /> : undefined}
          onClick={() => {
            hapticSelection();
            setLanguage(value);
          }}
        >
          <Text>{t(labelKey)}</Text>
        </Cell>
      ))}
    </>
  );
});

export default LanguageSwitcher;
