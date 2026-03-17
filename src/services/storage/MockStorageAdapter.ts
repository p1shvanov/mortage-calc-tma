import type { ICalculationsStorage } from './ICalculationsStorage';
import type { SavedCalculation, CalculationData } from '@/domain';
import { generateCalculationId } from '@/domain';

const STORAGE_KEY = 'tma-mortgage-calculator-storage';

export class MockStorageAdapter implements ICalculationsStorage {
  private getListFromStorage(): SavedCalculation[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw) as SavedCalculation[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  private setListToStorage(list: SavedCalculation[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }

  async getList(): Promise<SavedCalculation[]> {
    const list = this.getListFromStorage();
    return list.sort((a, b) =>
      b.createdAt > a.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : 0
    );
  }

  async getById(id: string): Promise<SavedCalculation | null> {
    const list = this.getListFromStorage();
    return list.find((c) => c.id === id) ?? null;
  }

  async save(calculation: CalculationData): Promise<SavedCalculation> {
    const list = this.getListFromStorage();
    const saved: SavedCalculation = {
      ...calculation,
      id: generateCalculationId(),
      createdAt: new Date().toISOString(),
    };
    list.unshift(saved);
    this.setListToStorage(list);
    return saved;
  }

  async update(id: string, calculation: CalculationData): Promise<SavedCalculation> {
    const list = this.getListFromStorage();
    const index = list.findIndex((c) => c.id === id);
    if (index === -1) {
      const saved: SavedCalculation = {
        ...calculation,
        id,
        createdAt: new Date().toISOString(),
      };
      list.unshift(saved);
      this.setListToStorage(list);
      return saved;
    }
    const existing = list[index];
    const updated: SavedCalculation = {
      ...calculation,
      id: existing.id,
      createdAt: existing.createdAt,
    };
    list[index] = updated;
    this.setListToStorage(list);
    return updated;
  }

  async delete(id: string): Promise<void> {
    const list = this.getListFromStorage().filter((c) => c.id !== id);
    this.setListToStorage(list);
  }
}
