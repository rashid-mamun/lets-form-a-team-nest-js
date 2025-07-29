import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient } from 'redis';

/**
 * Service for interacting with Redis cache.
 */
@Injectable()
export class RedisService implements OnModuleDestroy {
    private client: ReturnType<typeof createClient>;

    constructor(private configService: ConfigService) {
        this.client = createClient({
            socket: {
                host: this.configService.get<string>('REDIS.HOST', 'localhost'),
                port: this.configService.get<number>('REDIS.PORT', 6379),
            },
        });

        this.client.on('error', (err) => {
            console.error('Redis Client Error:', err);
        });

        this.client.on('connect', () => {
            console.log('Redis Client Connected');
        });

        this.connect();
    }

    private async connect(): Promise<void> {
        try {
            await this.client.connect();
        } catch (error) {
            console.error('Failed to connect to Redis:', error);
        }
    }

    async set(key: string, value: string, ttl?: number): Promise<void> {
        try {
            if (ttl) {
                await this.client.setEx(key, ttl, value);
            } else {
                await this.client.set(key, value);
            }
        } catch (error) {
            console.error('Redis set error:', error);
            throw new Error('Failed to set value in Redis');
        }
    }

    async get(key: string): Promise<string | null> {
        try {
            return await this.client.get(key);
        } catch (error) {
            console.error('Redis get error:', error);
            return null;
        }
    }

    async onModuleDestroy() {
        if (this.client) {
            await this.client.quit();
        }
    }
}
