import { memo } from 'react';

import { IconButton } from '@telegram-apps/telegram-ui';

import { useLocalization } from '@/providers/LocalizationProvider';
import { hapticSelection } from '@/utils/haptic';

const LanguageSwitcher = () => {
  const { language, setLanguage } = useLocalization();

  const toggleLanguage = () => {
    hapticSelection();
    setLanguage(language === 'en' ? 'ru' : 'en');
  };
  
  return (
    <IconButton onClick={toggleLanguage}>
      {language === 'en' ? '🇷🇺' : '🇬🇧'}
    </IconButton>
  );
}

export default memo(LanguageSwitcher);
