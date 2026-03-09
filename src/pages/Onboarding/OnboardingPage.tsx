import { FC, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Placeholder, Button, Section, List } from '@telegram-apps/telegram-ui';

import Page from '@/components/Page';
import { useLocalization } from '@/providers/LocalizationProvider';
import { setOnboardingCompleted, isOnboardingCompleted } from '@/services/onboardingStorage';
import { hapticButton } from '@/utils/haptic';

const STEPS = [
  'welcome',
  'features',
  'start',
] as const;

const OnboardingPage: FC = () => {
  const { t } = useLocalization();
  const navigate = useNavigate();
  const [stepIndex, setStepIndex] = useState(0);
  const step = STEPS[stepIndex];
  const isLast = stepIndex === STEPS.length - 1;

  const handleSkip = () => {
    hapticButton();
    setOnboardingCompleted();
    navigate('/', { replace: true });
  };

  const handleNext = () => {
    hapticButton();
    if (isLast) {
      setOnboardingCompleted();
      navigate('/', { replace: true });
    } else {
      setStepIndex((i) => i + 1);
    }
  };

  const canGoBack = isOnboardingCompleted();

  return (
    <Page back={canGoBack}>
      <List>
        <Section>
          {step === 'welcome' && (
            <Placeholder
              header={t('onboardingWelcomeTitle')}
              description={t('onboardingWelcomeDesc')}
              action={
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'stretch' }}>
                  <Button size="m" onClick={handleNext}>
                    {t('onboardingNext')}
                  </Button>
                  <Button size="m" mode="plain" onClick={handleSkip}>
                    {t('onboardingSkip')}
                  </Button>
                </div>
              }
            />
          )}
          {step === 'features' && (
            <Placeholder
              header={t('onboardingFeaturesTitle')}
              description={t('onboardingFeaturesDesc')}
              action={
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'stretch' }}>
                  <Button size="m" onClick={handleNext}>
                    {t('onboardingNext')}
                  </Button>
                  <Button size="m" mode="plain" onClick={handleSkip}>
                    {t('onboardingSkip')}
                  </Button>
                </div>
              }
            />
          )}
          {step === 'start' && (
            <Placeholder
              header={t('onboardingStartTitle')}
              description={t('onboardingStartDesc')}
              action={
                <Button size="m" onClick={handleNext}>
                  {t('onboardingGetStarted')}
                </Button>
              }
            />
          )}
        </Section>
      </List>
    </Page>
  );
};

export default OnboardingPage;
