import type { SavedCalculation, CalculationData } from '@/types/storage';

export interface ICalculationsStorage {
  getList(): Promise<SavedCalculation[]>;
  getById(id: string): Promise<SavedCalculation | null>;
  save(calculation: CalculationData): Promise<SavedCalculation>;
  update(id: string, calculation: CalculationData): Promise<SavedCalculation>;
  delete(id: string): Promise<void>;
}
