import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorResponse } from '../serializers/error.serializer';

export class BadRequestException extends HttpException {
    constructor(message: string, errors?: ErrorResponse[]) {
        super(
            {
                message: message,
                errors: errors ?? [message],
            },
            HttpStatus.BAD_REQUEST,
        );
        this.message = message;
    }
}
