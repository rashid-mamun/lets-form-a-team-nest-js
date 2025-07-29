import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppService } from './app.service';
import { SharedModule } from './shared/shared.module';
import { TerminusModule } from '@nestjs/terminus';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_CONFIG, AppConfigSchema } from './common/configs/app.config';
import { DATA_SOURCE_OPTIONS } from './common/configs/dataSource.config';
import { AuthModule } from './modules/auth/auth.module';
import { SeederModule } from './modules/seeder/seeder.module';
import { UserModule } from './modules/user/user.module';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';

@Module({
    imports: [
        ConfigModule.forRoot({
            load: [() => ({ ...APP_CONFIG, isGlobal: true })],
            validationSchema: AppConfigSchema,
        }),
        TypeOrmModule.forRoot(DATA_SOURCE_OPTIONS),
        ScheduleModule.forRoot(),
        TerminusModule,
        ThrottlerModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (_config: ConfigService) => [
                {
                    ttl: 60000, // 60 seconds in milliseconds
                    limit: 10,
                },
            ],
        }),
        SharedModule,
        AuthModule,
        SeederModule,
        UserModule,
    ],
    controllers: [AppController],
    providers: [
        AppService,
        {
            provide: APP_GUARD,
            useClass: ThrottlerGuard,
        },
    ],
})
export class AppModule implements NestModule {
    configure(_consumer: MiddlewareConsumer) {
        // consumer.apply(HeaderKeyMiddleware).forRoutes({ path: '/search/*', method: RequestMethod.ALL });
    }
}
