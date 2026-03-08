import type { SavedCalculation } from '@/types/storage';

export interface ICalculationsStorage {
  getList(): Promise<SavedCalculation[]>;
  getById(id: string): Promise<SavedCalculation | null>;
  save(calculation: Omit<SavedCalculation, 'id' | 'createdAt'>): Promise<SavedCalculation>;
  update(id: string, calculation: Omit<SavedCalculation, 'id' | 'createdAt'>): Promise<SavedCalculation>;
  delete(id: string): Promise<void>;
}
