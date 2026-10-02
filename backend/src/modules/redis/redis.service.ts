import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: Redis | null = null;
  private isConnected = false;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const redisUrl = this.configService.get<string>('redis.url') || process.env.REDIS_URL;
    const host = this.configService.get<string>('redis.host', 'localhost');
    const port = this.configService.get<number>('redis.port', 6379);
    const password = this.configService.get<string>('redis.password');
    const db = this.configService.get<number>('redis.db', 0);

    try {
      const redisOptions = {
        maxRetriesPerRequest: 2,
        retryStrategy: (times: number) => {
          if (times > 3) {
            this.logger.warn(`Redis reconnection stopped after ${times} attempts. Running with in-memory fallback.`);
            return null;
          }
          return Math.min(times * 1000, 3000);
        },
        lazyConnect: true,
      };

      if (redisUrl && redisUrl !== 'redis://localhost:6379') {
        this.client = new Redis(redisUrl, redisOptions);
        this.logger.log(`Connecting to Redis via REDIS_URL`);
      } else {
        this.client = new Redis({
          host,
          port,
          password: password || undefined,
          db,
          ...redisOptions,
        });
      }

      this.client.on('connect', () => {
        this.isConnected = true;
        this.logger.log(`Redis connected successfully`);
      });

      this.client.on('error', (err) => {
        this.isConnected = false;
        this.logger.warn(`Redis connection error: ${err.message}. Cache will operate in fallback mode.`);
      });

      this.client.connect().catch((err) => {
        this.logger.warn(`Initial Redis connection failed: ${err.message}. Continuing with cache fallback.`);
      });
    } catch (err: any) {
      this.logger.warn(`Failed to initialize Redis client: ${err.message}`);
    }
  }

  async onModuleDestroy() {
    if (this.client) {
      await this.client.quit().catch(() => {});
    }
  }

  getClient(): Redis | null {
    return this.client;
  }

  isHealthy(): boolean {
    return this.isConnected;
  }

  async get<T = any>(key: string): Promise<T | null> {
    if (!this.client || !this.isConnected) return null;
    try {
      const data = await this.client.get(key);
      if (!data) return null;
      return JSON.parse(data) as T;
    } catch (err: any) {
      this.logger.warn(`Redis get failed for key "${key}": ${err.message}`);
      return null;
    }
  }

  async set(key: string, value: any, ttlSeconds?: number): Promise<void> {
    if (!this.client || !this.isConnected) return;
    try {
      const serialized = JSON.stringify(value);
      if (ttlSeconds && ttlSeconds > 0) {
        await this.client.set(key, serialized, 'EX', ttlSeconds);
      } else {
        await this.client.set(key, serialized);
      }
    } catch (err: any) {
      this.logger.warn(`Redis set failed for key "${key}": ${err.message}`);
    }
  }

  async del(key: string): Promise<void> {
    if (!this.client || !this.isConnected) return;
    try {
      await this.client.del(key);
    } catch (err: any) {
      this.logger.warn(`Redis del failed for key "${key}": ${err.message}`);
    }
  }

  async invalidatePrefix(prefix: string): Promise<void> {
    if (!this.client || !this.isConnected) return;
    try {
      const keys = await this.client.keys(`${prefix}*`);
      if (keys.length > 0) {
        await this.client.del(...keys);
        this.logger.log(`Invalidated ${keys.length} keys matching prefix "${prefix}*"`);
      }
    } catch (err: any) {
      this.logger.warn(`Redis invalidatePrefix failed for "${prefix}": ${err.message}`);
    }
  }

  async getOrSet<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttlSeconds = 300,
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }
    const fresh = await fetchFn();
    if (fresh !== undefined && fresh !== null) {
      await this.set(key, fresh, ttlSeconds);
    }
    return fresh;
  }
}
