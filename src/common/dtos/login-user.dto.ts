import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginUserDto {
    @ApiProperty({ example: 'superAdmin', description: 'User username' })
    @IsString()
    @MinLength(3)
    username: string;

    @ApiProperty({ example: 'super_admin1', description: 'User password' })
    @IsString()
    @MinLength(6)
    password: string;
}
