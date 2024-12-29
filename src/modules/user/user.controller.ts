import { Body, Controller, HttpCode, HttpStatus, Post, Req } from '@nestjs/common';
import { Request } from 'express';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
    constructor(private userService: UserService) {}

    @Post('register')
    @HttpCode(HttpStatus.CREATED)
    async registerUser(@Body() createUserDto: any, @Req() req: Request) {
        // const reqUserUserTypeId: number = req.userTypeId;  // Assuming userTypeId is a custom property added to the request object
        return this.userService.registerUser(createUserDto);
    }
}
