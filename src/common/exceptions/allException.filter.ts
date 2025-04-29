import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { BaseApiException } from './baseApi.exception';
import { UnauthorisedException } from './unauthorised.exception';
import { CentralLogger } from '../../shared/loggerServices/centralLogger.service';

@Catch()
export class AllExceptionsFilter<T> implements ExceptionFilter {
    constructor(
        private config: ConfigService,
        private readonly logger: CentralLogger,
    ) {}
    catch(exception: T, host: ArgumentsHost): any {
        const ctx = host.switchToHttp();
        const res = ctx.getResponse<Response>();

        let status_code: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
        let message = 'Internal server error.';
        let errors: string | Record<string, any> = {};
        try {
            if (exception instanceof BaseApiException) {
                status_code = exception.getStatus();
                message = exception.message.toLowerCase();
                errors = exception.details || exception.getResponse();
            } else if (exception instanceof UnauthorisedException) {
                status_code = exception.getStatus();
                message = exception.message;
                if (typeof exception.getResponse() === 'object') {
                    errors = exception.getResponse();
                }
            } else if (exception instanceof HttpException) {
                status_code = exception.getStatus();

                message = exception.message;
                errors = exception.getResponse();
                if (typeof message === 'string') {
                    message = message.replace(' Exception', '').toLowerCase();
                }
            } else if (exception instanceof Error) {
                message = exception.message.toLowerCase();
            }

            if (errors && errors.hasOwnProperty('errors')) {
                errors = typeof errors === 'object' ? errors['errors'] : 'Internal server error';
            }

            const isProMood = this.config.get<string>('env') !== 'development';

            if (!errors) {
                if (typeof exception === 'string') {
                    errors = [
                        {
                            code: 500,
                            message: isProMood ? 'Internal server error' : exception,
                        },
                    ];
                }
            }

            const error = {
                success: false,
                message,
                errors,
            };
            console.log(error);
            this.logger.error(`A global error message occurred: ${error.message}`);
            this.logger.error(`A global exception occurred. Trace: ${(exception as Error).stack}`);
            res.status(status_code).json(error);
        } catch (errors) {
            this.logger.error(`A global exception occurred: ${errors.message}`);
            errors = [
                {
                    code: 500,
                    message: 'Internal server error',
                },
            ];

            const error = {
                success: false,
                message,
                errors,
            };

            res.status(status_code).json(error);
        }
    }
}
