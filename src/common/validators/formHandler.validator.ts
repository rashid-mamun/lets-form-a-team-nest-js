import { ArgumentMetadata, HttpStatus, ValidationPipe } from "@nestjs/common";
import { ValidationError } from "class-validator";
import { CentralLogger } from '../../shared/loggerServices/centralLogger.service';
import { ValidationException } from "../exceptions/validation.exception";

export class FormHandlerValidationPipe extends ValidationPipe {

    private readonly logger=new CentralLogger();
    private arrayOfErrors: any[] = [];

    public async transform(value: any, metadata: ArgumentMetadata): Promise<any> {
        this.arrayOfErrors = [];
        return await super.transform(value, metadata);
    }

    catchChildError = (errors: ValidationError[]) => {
        for (const error of errors) {
            if (error.constraints) {
                const constraintsMessages = Object.values(error.constraints);
                this.logger.info('',constraintsMessages);
                for (const message of constraintsMessages) {
                    this.arrayOfErrors.push({
                        code: HttpStatus.BAD_REQUEST,
                        message: message,
                    });

                }
            } else if (error.children && error.children.length) {
                this.exceptionFactory(error.children);
            }
            return;
        }
    }
    exceptionFactory = (errors: ValidationError[]) => {
        this.catchChildError(errors);
        return new ValidationException('Please input the valid data', this.arrayOfErrors);
    };


}