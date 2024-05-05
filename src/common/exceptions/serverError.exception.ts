import { HttpException, HttpStatus } from '@nestjs/common';

export class ServerErrorException extends HttpException {
    constructor(message: string) {
        super(
            {
                errors: [
                    {
                        code: HttpStatus.INTERNAL_SERVER_ERROR,
                        message: message ? message : 'internal server error',
                    },
                ],
            },
            HttpStatus.INTERNAL_SERVER_ERROR,
        );
        this.message = message;
    }
}
