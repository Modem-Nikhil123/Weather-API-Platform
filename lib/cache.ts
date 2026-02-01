/**
 * Cache interface for abstraction
 */
export interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

export interface CacheOptions {
  ttl?: number; // Time to live in seconds (default: 300 = 5 minutes)
}

/**
 * Abstract cache interface
 */
export interface ICache {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, data: T, options?: CacheOptions): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
  has(key: string): Promise<boolean>;
}

/**
 * In-memory cache implementation
 * Note: In production, use Redis for distributed caching
 */
export class InMemoryCache implements ICache {
  private cache: Map<string, CacheEntry<any>>;
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    this.cache = new Map();
    // Clean up expired entries every minute
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60 * 1000);
  }

  async get<T>(key: string): Promise<T | null> {
    const entry = this.cache.get(key);
    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  async set<T>(
    key: string,
    data: T,
    options: CacheOptions = {}
  ): Promise<void> {
    const ttl = options.ttl || 300; // Default 5 minutes
    const expiresAt = Date.now() + ttl * 1000;

    this.cache.set(key, {
      data,
      expiresAt,
    });
  }

  async delete(key: string): Promise<void> {
    this.cache.delete(key);
  }

  async clear(): Promise<void> {
    this.cache.clear();
  }

  async has(key: string): Promise<boolean> {
    const entry = this.cache.get(key);
    if (!entry) {
      return false;
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  destroy(): void {
    clearInterval(this.cleanupInterval);
    this.cache.clear();
  }
}

// Global cache instance
let cacheInstance: InMemoryCache | null = null;

/**
 * Get or create cache instance
 */
export function getCache(): InMemoryCache {
  if (!cacheInstance) {
    cacheInstance = new InMemoryCache();
  }
  return cacheInstance;
}

/**
 * Cache key generators
 */
export const CacheKeys = {
  weather: {
    current: (city: string) => `weather:current:${city.toLowerCase()}`,
    history: (city: string, hours: number) =>
      `weather:history:${city.toLowerCase()}:${hours}`,
    dailyAverage: (city: string, date: string) =>
      `weather:daily:${city.toLowerCase()}:${date}`,
  },
  apiKey: (key: string) => `apikey:${key}`,
  analytics: {
    weather: (date: string) => `analytics:weather:${date}`,
  },
  cities: {
    all: (activeOnly: boolean) => `cities:all:${activeOnly}`,
  },
};

/**
 * Cache TTL constants (in seconds)
 */
export const CacheTTL = {
  WEATHER_CURRENT: 600, // 10 minutes
  WEATHER_HISTORY: 300, // 5 minutes
  WEATHER_DAILY: 3600, // 1 hour
  API_KEY: 3600, // 1 hour
  ANALYTICS: 900, // 15 minutes
  CITIES: 300, // 5 minutes
};
