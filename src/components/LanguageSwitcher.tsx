import { memo } from 'react';
import { Cell, Checkbox, Text } from '@telegram-apps/telegram-ui';
import { useLocalization } from '@/providers/LocalizationProvider';
import { hapticSelection } from '@/utils/haptic';
import type { SupportedLanguage } from '@/providers/LocalizationProvider';

/** Locale id and label key for the language list. Easy to extend. */
export const LANGUAGES: { value: SupportedLanguage; labelKey: 'languageEnglish' | 'languageRussian' }[] = [
  { value: 'en', labelKey: 'languageEnglish' },
  { value: 'ru', labelKey: 'languageRussian' },
];

/**
 * Renders a list of language options as tappable cells.
 * Selected item shows a checkmark (Checkbox). Scales to any number of locales.
 */
const LanguageSwitcher = () => {
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
};

export default memo(LanguageSwitcher);
