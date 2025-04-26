import { useMemo } from 'react';
import { useLocalization } from '@/providers/LocalizationProvider';
import { createLocalizedSchemas } from '@/validation/createLocalizedSchemas';

/**
 * Hook that provides localized schema factory functions
 * @returns Object with schema creation functions
 */
export const useLocalizedSchemas = () => {
  const { t, language } = useLocalization();
  
  // Create localized schemas using the current language
  const schemas = useMemo(() => {
    return createLocalizedSchemas(t);
  }, [t, language]);
  
  return schemas;
};
