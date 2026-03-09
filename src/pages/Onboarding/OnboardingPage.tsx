import { FC, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Placeholder,
  Button,
  Section,
  List,
  Cell,
  Steps,
  InlineButtons,
  Accordion,
} from '@telegram-apps/telegram-ui';

import Page from '@/components/Page';
import { useLocalization } from '@/providers/LocalizationProvider';
import {
  setOnboardingCompleted,
  isOnboardingCompleted,
} from '@/services/onboardingStorage';
import { hapticButton, hapticSelection } from '@/utils/haptic';

const STEPS = [
  'welcome',
  'form',
  'paymentTypes',
  'early',
  'start',
] as const;

const TOTAL_STEPS = STEPS.length;

type Step = (typeof STEPS)[number];

const FORM_FIELDS: { subheadKey: string; hintKey: string }[] = [
  { subheadKey: 'loanAmount', hintKey: 'hintLoanAmount' },
  { subheadKey: 'interestRate', hintKey: 'hintInterestRate' },
  { subheadKey: 'loanTerm', hintKey: 'hintLoanTerm' },
  { subheadKey: 'startDate', hintKey: 'hintStartDate' },
  { subheadKey: 'paymentDay', hintKey: 'hintPaymentDay' },
];

const OnboardingPage: FC = () => {
  const { t } = useLocalization();
  const navigate = useNavigate();
  const [stepIndex, setStepIndex] = useState(0);
  const [expandedFormField, setExpandedFormField] = useState<number | null>(null);
  const step: Step = STEPS[stepIndex];
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

  const goToStep = (index: number) => {
    if (index >= 0 && index < TOTAL_STEPS && index !== stepIndex) {
      hapticSelection();
      setStepIndex(index);
    }
  };

  const canGoBack = isOnboardingCompleted();

  const renderPagination = () => (
    <Section>
      <List>
        <Cell
          subtitle={t('onboardingStepOf', {
            current: String(stepIndex + 1),
            total: String(TOTAL_STEPS),
          })}
          after={
            <InlineButtons mode="plain">
              {STEPS.map((_, i) => (
                <InlineButtons.Item
                  key={i}
                  text={stepIndex === i ? '●' : '○'}
                  onClick={() => goToStep(i)}
                  aria-label={`Step ${i + 1}`}
                />
              ))}
            </InlineButtons>
          }
        />
      </List>
    </Section>
  );

  const renderActions = (skipVisible: boolean) => (
    <Section>
      <List>
        <Button size="m" stretched onClick={handleNext}>
          {isLast ? t('onboardingGetStarted') : t('onboardingNext')}
        </Button>
        {skipVisible && (
          <Button size="m" mode="plain" stretched onClick={handleSkip}>
            {t('onboardingSkip')}
          </Button>
        )}
      </List>
    </Section>
  );

  const renderStepContent = () => {
    if (step === 'welcome') {
      return (
        <>
          <Section>
            <List>
              <Steps count={TOTAL_STEPS} progress={stepIndex} />
            </List>
          </Section>
          <Placeholder
            header={t('onboardingWelcomeTitle')}
            description={t('onboardingWelcomeDesc')}
            action={
              <List>
                <Button size="m" stretched onClick={handleNext}>
                  {t('onboardingNext')}
                </Button>
                <Button size="m" mode="plain" stretched onClick={handleSkip}>
                  {t('onboardingSkip')}
                </Button>
              </List>
            }
          />
        </>
      );
    }

    if (step === 'form') {
      return (
        <>
          <Section>
            <List>
              <Steps count={TOTAL_STEPS} progress={stepIndex} />
            </List>
          </Section>
          <Section header={t('onboardingFormTitle')}>
            <List>
              <Cell subtitle={t('onboardingFormLead')} multiline />
            </List>
          </Section>
          <Section header={t('loanDetails')}>
            <List>
              {FORM_FIELDS.map(({ subheadKey, hintKey }, i) => (
                <Accordion
                  key={subheadKey}
                  expanded={expandedFormField === i}
                  onChange={(expanded) => {
                    hapticSelection();
                    setExpandedFormField(expanded ? i : null);
                  }}
                >
                  <Accordion.Summary>{t(subheadKey)}</Accordion.Summary>
                  <Accordion.Content>
                    <Cell subtitle={t(hintKey)} multiline />
                  </Accordion.Content>
                </Accordion>
              ))}
            </List>
          </Section>
          {renderPagination()}
          {renderActions(true)}
        </>
      );
    }

    if (step === 'paymentTypes') {
      return (
        <>
          <Section>
            <List>
              <Steps count={TOTAL_STEPS} progress={stepIndex} />
            </List>
          </Section>
          <Section header={t('paymentType')}>
            <List>
              <Cell subtitle={t('onboardingPaymentTypesLead')} multiline />
              <Cell subtitle={t('hintPaymentType')} multiline />
            </List>
          </Section>
          {renderPagination()}
          {renderActions(true)}
        </>
      );
    }

    if (step === 'early') {
      return (
        <>
          <Section>
            <List>
              <Steps count={TOTAL_STEPS} progress={stepIndex} />
            </List>
          </Section>
          <Section header={t('earlyPayment')}>
            <List>
              <Cell subtitle={t('onboardingEarlyLead')} multiline />
              <Cell subtitle={t('hintEarlyPaymentType')} multiline />
            </List>
          </Section>
          {renderPagination()}
          {renderActions(true)}
        </>
      );
    }

    // start
    return (
      <>
        <Section>
          <List>
            <Steps count={TOTAL_STEPS} progress={stepIndex} />
          </List>
        </Section>
        <Placeholder
          header={t('onboardingStartTitle')}
          description={t('onboardingStartDesc')}
          action={
            <Button size="m" stretched onClick={handleNext}>
              {t('onboardingGetStarted')}
            </Button>
          }
        />
        {renderPagination()}
      </>
    );
  };

  return (
    <Page back={canGoBack}>
      <List>{renderStepContent()}</List>
    </Page>
  );
};

export default OnboardingPage;
