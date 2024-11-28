import { API_CONFIG } from '@/config/api';

interface CacheItem<T> {
  data: T;
  timestamp: number;
}

export class Cache {
  static set<T>(key: string, data: T): void {
    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
    };
    localStorage.setItem(key, JSON.stringify(item));
  }

  static get<T>(key: string): T | null {
    const item = localStorage.getItem(key);
    if (!item) return null;

    const parsedItem: CacheItem<T> = JSON.parse(item);
    const now = Date.now();

    if (now - parsedItem.timestamp > API_CONFIG.CACHE_DURATION) {
      localStorage.removeItem(key);
      return null;
    }

    return parsedItem.data;
  }

  static remove(key: string): void {
    localStorage.removeItem(key);
  }

  static clear(): void {
    localStorage.clear();
  }

  static isExpired(key: string): boolean {
    const item = localStorage.getItem(key);
    if (!item) return true;

    const parsedItem: CacheItem<any> = JSON.parse(item);
    const now = Date.now();

    return now - parsedItem.timestamp > API_CONFIG.CACHE_DURATION;
  }
}
