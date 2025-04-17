import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { HealthCheckService, TypeOrmHealthIndicator, HealthCheck } from '@nestjs/terminus';
import { ApiTags } from '@nestjs/swagger';
import { SWAGGER_API_TAGS } from './common/constants/common.constant';

@ApiTags(SWAGGER_API_TAGS.APP)
@Controller()
export class AppController {
    constructor(
        private readonly appService: AppService,
        private readonly health: HealthCheckService,
        private db: TypeOrmHealthIndicator,
    ) {}

    @Get()
    async index() {
        return 'welcome to lets-form-a-team';
    }
    @Get('health-check')
    @HealthCheck()
    async healthCheck() {
        const data = await this.health.check([async () => await this.db.pingCheck('database')]);
        return data;
    }
}
