import { Button } from '@telegram-apps/telegram-ui';
import { useLocalization } from '@/providers/LocalizationProvider';

export function LanguageSwitcher() {
  const { language, setLanguage } = useLocalization();
  
  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ru' : 'en');
  };
  
  return (
    <Button onClick={toggleLanguage}>
      {language === 'en' ? 'RU' : 'EN'}
    </Button>
  );
}
