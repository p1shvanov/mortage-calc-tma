import { memo, useState } from 'react';
import { Cell, Checkbox, Text, Modal, List, Section } from '@telegram-apps/telegram-ui';
import { Icon24ChevronRight } from '@telegram-apps/telegram-ui/dist/icons/24/chevron_right';
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
  const [modalOpen, setModalOpen] = useState(false);

  const handleSelect = (value: SupportedLanguage) => {
    hapticSelection();
    setLanguage(value);
    setModalOpen(false);
  };

  return (
    <>
      <Cell
        after={<Icon24ChevronRight />}
        onClick={() => {
          hapticSelection();
          setModalOpen(true);
        }}
      >
        <Text>{t(LANGUAGE_LABEL_KEYS[language])}</Text>
      </Cell>
      <Modal open={modalOpen} onOpenChange={setModalOpen}>
        <List>
          <Section>
            {LANGUAGES.map(({ value, labelKey }) => (
              <Cell
                key={value}
                after={language === value ? <Checkbox checked disabled /> : undefined}
                onClick={() => handleSelect(value)}
              >
                <Text>{t(labelKey)}</Text>
              </Cell>
            ))}
          </Section>
        </List>
      </Modal>
    </>
  );
});

export default LanguageSwitcher;
