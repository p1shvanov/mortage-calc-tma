import type { ICalculationsStorage } from './ICalculationsStorage';
import { MockStorageAdapter } from './MockStorageAdapter';
import {
  TelegramCloudStorageAdapter,
  type CloudStorageBackend,
} from './TelegramCloudStorageAdapter';

let instance: ICalculationsStorage | null = null;

/**
 * Returns the calculations storage adapter.
 * In dev or when Telegram Cloud Storage is unavailable, uses localStorage (MockStorageAdapter).
 * In production inside Telegram Mini App, uses Telegram Cloud Storage when available.
 */
export function getCalculationsStorage(): ICalculationsStorage {
  if (instance) return instance;

  const isDev = import.meta.env.DEV;

  if (isDev) {
    instance = new MockStorageAdapter();
    return instance;
  }

  try {
    const cloudStorage = (window as unknown as { Telegram?: { WebApp?: unknown } })
      .Telegram?.WebApp;
    if (cloudStorage && typeof (cloudStorage as { CloudStorage?: unknown }).CloudStorage !== 'undefined') {
      const cloud = (cloudStorage as { CloudStorage: { get: (k: string) => Promise<string>; set: (k: string, v: string) => Promise<void>; delete: (k: string) => Promise<void> } }).CloudStorage;
      const backend: CloudStorageBackend = {
        get: (key) => cloud.get(key),
        set: (key, value) => cloud.set(key, value),
        delete: (key) => cloud.delete(key),
      };
      instance = new TelegramCloudStorageAdapter(backend);
      return instance;
    }
  } catch {
    // fallback to mock
  }

  instance = new MockStorageAdapter();
  return instance;
}
