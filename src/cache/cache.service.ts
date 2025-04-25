import { Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { CreateCacheDto } from './dto/create-cache.dto';
import { UpdateCacheDto } from './dto/update-cache.dto';

@Injectable()
export class CacheService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  // Fix the type issue by handling null case
  async get<T>(key: string): Promise<T | null> {
    return this.cacheManager.get<T>(key);
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    await this.cacheManager.set(key, value, ttl);
  }

  async del(key: string): Promise<void> {
    await this.cacheManager.del(key);
  }

  // 'reset' should be 'del' for most cache implementations or use flush() if available
  async clear(): Promise<void> {
    // Some implementations use flush() instead of reset()
    if ('flush' in this.cacheManager) {
      await (this.cacheManager as any).flush();
    } else {
      // For safety, this is a fallback but may not work with all cache implementations
      console.warn('Cache manager does not have flush method');
    }
  }

  // Add CRUD methods that the controller is trying to use
  async create(createCacheDto: CreateCacheDto): Promise<any> {
    const { key, value, ttl } = createCacheDto;
    await this.set(key, value, ttl);
    return { success: true, key };
  }

  async findAll(): Promise<any> {
    // This is trickier as most cache implementations don't easily list all keys
    // You might need to maintain a separate list of keys in another cache entry
    return { message: 'List all cache entries is not supported directly' };
  }

  async findOne(id: number): Promise<any> {
    // Assuming id is used as the key or is converted to a key
    const key = `cache-${id}`;
    return this.get(key);
  }

  async update(id: number, updateCacheDto: UpdateCacheDto): Promise<any> {
    const key = `cache-${id}`;
    const { value, ttl } = updateCacheDto;
    await this.set(key, value, ttl);
    return { success: true, key };
  }

  async remove(id: number): Promise<any> {
    const key = `cache-${id}`;
    await this.del(key);
    return { success: true, key };
  }
}