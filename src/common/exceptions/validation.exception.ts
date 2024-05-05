import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorResponse } from '../serializers/error.serializer';

export class ValidationException extends HttpException {
    constructor(message: string, errors: ErrorResponse[]) {
        super(
            {
                errors: errors,
            },
            HttpStatus.BAD_REQUEST,
        );
        this.message = message;
    }
}
