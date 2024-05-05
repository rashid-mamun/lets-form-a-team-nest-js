import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorResponse } from '../serializers/error.serializer';

export class NotFoundException extends HttpException {
    constructor(message = 'resource', errors: ErrorResponse[] = []) {
        if (Object.keys(errors).length === 0) {
            errors = [
                {
                    code: HttpStatus.NOT_FOUND,
                    message: message,
                },
            ];
        }
        super(
            {
                message: message,
                errors,
            },
            HttpStatus.NOT_FOUND,
        );
    }
}
