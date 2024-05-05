import { HttpStatus } from "@nestjs/common";
import { IsArray, IsBoolean, IsEnum, IsString } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';
import { Type } from "class-transformer";

export class CommonErrorResponse {

    @ApiProperty({ default: false })
    @IsBoolean()
    success: boolean

    @ApiProperty()
    @IsString()
    message: string

    @ApiProperty({ type: () => ErrorResponse, isArray: true })
    @Type(() => ErrorResponse)
    @IsArray()
    errors: ErrorResponse[]
}


export class ErrorResponse {

    @ApiProperty({ example: 400 })
    @IsEnum(HttpStatus)
    code: number;

    @ApiProperty()
    @IsString()
    message: string
}