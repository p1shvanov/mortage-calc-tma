import { memo } from 'react';

import { Button, List } from '@telegram-apps/telegram-ui';

import { useLocalization } from '@/providers/LocalizationProvider';
import { useMortgage } from '@/providers/MortgageProvider';

import EarlyPaymentContainer from '@/components/EarlyPaymentContainer';
import LoanDetails from '@/components/LoanDetails';

import { generateAmortizationSchedule } from '@/utils/amortizationSchedule';
import { calculateMortgage } from '@/utils/mortgageCalculator';

type MortageFormPropsType = {
  setIsModalOpened: (value: boolean) => void;
};

const MortageForm: React.FC<MortageFormPropsType> = ({ setIsModalOpened }) => {
  const { t } = useLocalization();
  const {
    loanDetails,
    setMortgageResults,
    setAmortizationResult,
    earlyPayments,
  } = useMortgage();

  const handleCalculate = () => {
    if (loanDetails) {
      try {
        const mortage = calculateMortgage(loanDetails);
        setMortgageResults(mortage);
        setIsModalOpened(true);
      } catch (error) {
        console.error('Error calculating mortgage results:', error);
      }

      try {
        const amortization = generateAmortizationSchedule({
          loanAmount: loanDetails.loanAmount,
          interestRate: loanDetails.interestRate,
          loanTerm: loanDetails.loanTerm,
          startDate: loanDetails.startDate,
          paymentType: loanDetails.paymentType,
          paymentDay: loanDetails.paymentDay,
          earlyPayments,
        });
        setAmortizationResult(amortization);
      } catch (error) {
        console.error('Error generating amortization schedule:', error);
      }
    }
  };

  return (
    <List>
      <LoanDetails />
      <EarlyPaymentContainer />
      <Button onClick={handleCalculate} stretched>
        {t('calculate')}
      </Button>
    </List>
  );
};

export default memo(MortageForm);
