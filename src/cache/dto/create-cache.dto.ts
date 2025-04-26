export class CreateCacheDto {
    key: string; // The key for the cache entry
    value: any;  // The value to be cached
    ttl?: number; // Optional time-to-live (in seconds) for the cache entry
  }