export interface CacheConfig {
    ttl: number;
    maxSize: number;
    purgeStrategy: 'lru' | 'fifo' | 'lfu';
    invalidationHooks: {
      onContentUpdate: boolean;
      onUserRoleChange: boolean;
      manualInvalidation: boolean;
    };
  }
  