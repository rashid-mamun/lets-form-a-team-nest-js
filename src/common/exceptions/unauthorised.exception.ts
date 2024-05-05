import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorResponse } from '../serializers/error.serializer';

export class UnauthorisedException extends HttpException {
    constructor(message?: string, errors?: ErrorResponse[]) {
        if (message && message.length > 0 && typeof errors === 'object') {
            super(
                {
                    message: message,
                    errors: errors,
                },
                HttpStatus.UNAUTHORIZED,
            );
        } else if (message && message.length > 0 && errors?.length) {
            let errorMessage: ErrorResponse[] = [];

            if (typeof message === 'string') {
                errorMessage = [
                    {
                        code: HttpStatus.UNAUTHORIZED,
                        message: message
                            .toLocaleLowerCase() // make it lowercase
                            .replace(/([.,\/#!$%\^&\*;:{}=\-_`~()\]\[])+$/g, '') // remove punctuation marks
                            .replace(' ', '_'), // replace spaces with _ underscores
                    },
                ];
            } else {
                errorMessage = message;
            }
            super({ message: message, errors: errorMessage }, HttpStatus.UNAUTHORIZED);
        } else {
            super(
                {
                    message: message,
                    errors: [
                        {
                            code: HttpStatus.UNAUTHORIZED,
                            message: 'unauthorized',
                        },
                    ],
                },
                HttpStatus.UNAUTHORIZED,
            );
        }
    }
}
