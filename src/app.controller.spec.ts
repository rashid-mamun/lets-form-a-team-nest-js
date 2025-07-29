import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CentralLogger } from './shared/loggerServices/centralLogger.service';
import { HealthCheckService, TypeOrmHealthIndicator } from '@nestjs/terminus';

describe('AppController', () => {
    let appController: AppController;
    let _appService: AppService;

    beforeEach(async () => {
        const app: TestingModule = await Test.createTestingModule({
            controllers: [AppController],
            providers: [
                AppService,
                {
                    provide: CentralLogger,
                    useValue: {
                        info: jest.fn(),
                        error: jest.fn(),
                        warn: jest.fn(),
                    },
                },
                {
                    provide: HealthCheckService,
                    useValue: {
                        check: jest.fn(),
                    },
                },
                {
                    provide: TypeOrmHealthIndicator,
                    useValue: {
                        pingCheck: jest.fn(),
                    },
                },
            ],
        }).compile();

        appController = app.get<AppController>(AppController);
        _appService = app.get<AppService>(AppService);
    });

    it('should be defined', () => {
        expect(appController).toBeDefined();
    });

    it('should return welcome message', async () => {
        const result = await appController.index();
        expect(result).toBe('welcome to lets-form-a-team');
    });
});
