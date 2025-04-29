import { HttpModule } from '@nestjs/axios';
import { ThrottlerModule } from '@nestjs/throttler';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { CentralLogger } from './loggerServices/centralLogger.service';
import { AxiosService } from './httpServices/axios.service';
import { RedisService } from './redis/redis.service';

const httpServices = [AxiosService];

@Module({
    imports: [HttpModule, ConfigModule],
    exports: [HttpModule, CentralLogger, ...httpServices, RedisService],
    providers: [CentralLogger, ...httpServices, RedisService],
})
export class SharedModule {}
