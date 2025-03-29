import { EarlyPaymentForm } from './EarlyPaymentForm';
import { EarlyPaymentList } from './EarlyPaymentList';
import { useMortgage, EarlyPayment } from '@/providers/MortgageProvider';
import styles from './EarlyPayment.module.css';

export function EarlyPaymentContainer() {
  const { loanDetails, earlyPayments, setEarlyPayments } = useMortgage();
  
  if (!loanDetails) {
    return null;
  }
  
  const handleAddPayment = (payment: Omit<EarlyPayment, 'id'>) => {
    const newPayment: EarlyPayment = {
      ...payment,
      id: Date.now().toString()
    };
    
    setEarlyPayments([...earlyPayments, newPayment]);
  };
  
  const handleRemovePayment = (id: string) => {
    setEarlyPayments(earlyPayments.filter(payment => payment.id !== id));
  };
  
  return (
    <div className={styles.container}>
      <EarlyPaymentForm 
        onAddPayment={handleAddPayment} 
        loanTerm={loanDetails.loanTerm} 
      />
      <EarlyPaymentList 
        payments={earlyPayments} 
        onRemovePayment={handleRemovePayment} 
      />
    </div>
  );
}
