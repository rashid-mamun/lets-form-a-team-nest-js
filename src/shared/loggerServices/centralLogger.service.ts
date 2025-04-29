import { Injectable } from '@nestjs/common';
import pino from 'pino';
import { PINO_CONFIG_OPTIONS } from '../../common/configs/pinoLogger.config';
const logger = pino(PINO_CONFIG_OPTIONS);

@Injectable()
export class CentralLogger {
    error(message: string, trace?: Record<string, any>) {
        logger.error(trace, message);
    }
    warn(message: string, data?: Record<string, any>) {
        logger.warn(data, message);
    }

    info(message: string, data?: Record<string, any>) {
        logger.info(data, message);
    }
}
