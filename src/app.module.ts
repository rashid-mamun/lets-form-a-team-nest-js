import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule } from '@nestjs/config';
import { AppService } from './app.service';
import { SharedModule } from './shared/shared.module';
import { TerminusModule } from '@nestjs/terminus';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_CONFIG, AppConfigSchema } from './common/configs/app.config';
import { DATA_SOURCE_OPTIONS } from './common/configs/dataSource.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [() => ({ ...APP_CONFIG, isGlobal: true })],
      validationSchema: AppConfigSchema,
    }),
    TypeOrmModule.forRoot(DATA_SOURCE_OPTIONS),
    ScheduleModule.forRoot(),
    TerminusModule,
    SharedModule,
   
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // consumer.apply(HeaderKeyMiddleware).forRoutes({ path: '/search/*', method: RequestMethod.ALL });
  }
}
