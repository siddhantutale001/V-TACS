// Simulated Redis In-Memory Cache for Static Hospital Location Matrices

class LocationCache {
  constructor() {
    this.cache = new Map();
    this.ttlMs = 10 * 60 * 1000; // 10 minute cache TTL
  }

  set(key, data) {
    this.cache.set(key, {
      value: data,
      expiresAt: Date.now() + this.ttlMs
    });
  }

  get(key) {
    const cached = this.cache.get(key);
    if (!cached) return null;
    if (Date.now() > cached.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    return cached.value;
  }

  invalidate(key) {
    this.cache.delete(key);
  }

  clear() {
    this.cache.clear();
  }
}

export const locationCache = new LocationCache();
