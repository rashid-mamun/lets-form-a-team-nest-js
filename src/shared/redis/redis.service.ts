import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient } from 'redis';

/**
 * Service for interacting with Redis cache.
 */
@Injectable()
export class RedisService {
    private client: ReturnType<typeof createClient>;

    constructor(private configService: ConfigService) {
        this.client = createClient({
            socket: {
                host: this.configService.get<string>('REDIS.HOST', 'localhost'),
                port: this.configService.get<number>('REDIS.PORT', 6379),
            },
        });
        this.client.connect();
    }

    async set(key: string, value: string, ttl?: number): Promise<void> {
        if (ttl) {
            await this.client.setEx(key, ttl, value);
        } else {
            await this.client.set(key, value);
        }
    }

    async get(key: string): Promise<string | null> {
        return await this.client.get(key);
    }
}
