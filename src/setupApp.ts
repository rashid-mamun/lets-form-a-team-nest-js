import { ClassSerializerInterceptor, INestApplication, ValidationPipe } from '@nestjs/common';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import * as compression from 'compression';
import { useContainer } from 'class-validator';
import { AppModule } from './app.module';
import { FormHandlerValidationPipe } from './common/validators/formHandler.validator';
import { VALIDATION_PIPE_OPTIONS } from './common/configs/validationPipe.config';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AxiosService } from './shared/httpServices/axios.service';
import { CentralLogger } from './shared/loggerServices/centralLogger.service';
import { AllExceptionsFilter } from './common/exceptions/allException.filter';
import * as bodyParser from 'body-parser';
import { setupSwagger } from './swagger';

export const setupAPP = async (app: INestApplication) => {
    const corsOptions: CorsOptions = {
        origin: '*',
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        preflightContinue: false,
        optionsSuccessStatus: 200,
        credentials: true,
        allowedHeaders: 'Access-Control-Allow-Headers,Origin,X-Requested-With,Content-Type,Accept,Authorization,authorization,X-Forwarded-for',
    };
    app.enableCors();
    app.use(compression());
    useContainer(app.select(AppModule), { fallbackOnErrors: true });

    app.setGlobalPrefix('api/');

    app.useGlobalPipes(new FormHandlerValidationPipe(VALIDATION_PIPE_OPTIONS));
    app.useGlobalPipes(new ValidationPipe());
    app.useGlobalInterceptors(new ResponseInterceptor());

    // automatically be serialized to json
    const reflector = app.get(Reflector);
    app.useGlobalInterceptors(new ClassSerializerInterceptor(reflector));

    const configSvc = app.get(ConfigService);

    const httpSvc = await app.resolve(AxiosService);

    const centralLogger = new CentralLogger();
    app.useGlobalFilters(new AllExceptionsFilter(configSvc, centralLogger));

    app.use(bodyParser.json({ limit: '50mb' }));
    app.use(bodyParser.urlencoded({ limit: '50mb', extended: false }));
    setupSwagger(app);
};
