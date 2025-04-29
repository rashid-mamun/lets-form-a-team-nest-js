import { IsString, IsEmail, IsEnum, IsInt, MinLength } from 'class-validator';
import { EUserTypes } from '../constants/common.enum';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
    @ApiProperty({ example: 'manager1', description: 'Unique username' })
    @IsString()
    @MinLength(3)
    username: string;

    @ApiProperty({ example: 'Manager1', description: 'User password' })
    @IsString()
    @MinLength(6)
    password: string;

    @ApiProperty({ example: 'John Manager', description: 'Full name' })
    @IsString()
    name: string;

    @ApiProperty({ example: 'john@hrhero.com', description: 'Email address' })
    @IsEmail()
    email: string;

    @ApiProperty({ example: '01789652243', description: 'Contact number' })
    @IsString()
    contactNumber: string;

    @ApiProperty({ example: EUserTypes.MANAGER, description: 'User type (1: Super Admin, 2: Manager, 3: Employee)' })
    @IsEnum(EUserTypes)
    userTypeId: EUserTypes;

    @ApiProperty({ example: 1, description: 'ID of the user performing the action' })
    @IsInt()
    userId: number;
}
