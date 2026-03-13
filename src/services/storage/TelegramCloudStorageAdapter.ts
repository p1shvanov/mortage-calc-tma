import type { ICalculationsStorage } from './ICalculationsStorage';
import type { SavedCalculation, CalculationData } from '@/types/storage';
import { generateCalculationId } from '@/domain';

const STORAGE_KEY = 'mortage-calc-calculations';

/**
 * Backend for cloud storage (Telegram Cloud Storage or compatible key-value API).
 */
export interface CloudStorageBackend {
  get(key: string): Promise<string>;
  set(key: string, value: string): Promise<void>;
  delete(key: string): Promise<void>;
}

export class TelegramCloudStorageAdapter implements ICalculationsStorage {
  constructor(private readonly backend: CloudStorageBackend) {}

  private async getListFromStorage(): Promise<SavedCalculation[]> {
    try {
      const raw = await this.backend.get(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw) as SavedCalculation[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  private async setListToStorage(list: SavedCalculation[]): Promise<void> {
    await this.backend.set(STORAGE_KEY, JSON.stringify(list));
  }

  async getList(): Promise<SavedCalculation[]> {
    const list = await this.getListFromStorage();
    return list.sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1));
  }

  async getById(id: string): Promise<SavedCalculation | null> {
    const list = await this.getListFromStorage();
    return list.find((c) => c.id === id) ?? null;
  }

  async save(calculation: CalculationData): Promise<SavedCalculation> {
    const list = await this.getListFromStorage();
    const saved: SavedCalculation = {
      ...calculation,
      id: generateCalculationId(),
      createdAt: new Date().toISOString(),
    };
    list.unshift(saved);
    await this.setListToStorage(list);
    return saved;
  }

  async update(id: string, calculation: CalculationData): Promise<SavedCalculation> {
    const list = await this.getListFromStorage();
    const index = list.findIndex((c) => c.id === id);
    if (index === -1) {
      const saved: SavedCalculation = {
        ...calculation,
        id,
        createdAt: new Date().toISOString(),
      };
      list.unshift(saved);
      await this.setListToStorage(list);
      return saved;
    }
    const existing = list[index];
    const updated: SavedCalculation = {
      ...calculation,
      id: existing.id,
      createdAt: existing.createdAt,
    };
    list[index] = updated;
    await this.setListToStorage(list);
    return updated;
  }

  async delete(id: string): Promise<void> {
    const list = (await this.getListFromStorage()).filter((c) => c.id !== id);
    await this.setListToStorage(list);
  }
}
