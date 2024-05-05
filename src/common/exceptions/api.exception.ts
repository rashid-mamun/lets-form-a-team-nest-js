import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorResponse } from '../serializers/error.serializer';
export class ApiException extends HttpException {
    constructor(errors: ErrorResponse[], message = 'Please try later.', statusCode: HttpStatus = HttpStatus.UNPROCESSABLE_ENTITY) {
        super(
            {
                message,
                errors,
            },
            statusCode,
        );
    }
}
