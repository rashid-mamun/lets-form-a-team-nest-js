import { HttpException } from '@nestjs/common';

export class BaseApiException extends HttpException {
    public details: string | Record<string, any>;

    constructor(message: string, status: number, details?: string | Record<string, any>) {
        super(message, status);
        this.name = BaseApiException.name;
        this.details = details ? details : '';
    }
}
