import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorResponse } from '../serializers/error.serializer';
export class AlreadyExistException extends HttpException {
    constructor(resource_name = 'resource', messages: object | null = null) {
        let errors: ErrorResponse[] = [];

        if (Object.keys(errors).length === 0) {
            errors = [
                {
                    code: HttpStatus.NOT_FOUND,
                    message: `${resource_name} already exist.`,
                },
            ];
        }
        super(
            {
                message: `${resource_name} already exist.`,
                errors,
            },
            HttpStatus.CONFLICT,
        );
    }
}
