import { Controller, Request, Post, UseGuards, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';


@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('signup')
    @HttpCode(HttpStatus.CREATED)
    async registerUser(@Body() createUserDto: any) {
        return this.authService.registerUser(createUserDto);
    }

    @UseGuards(LocalAuthGuard)
    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(@Request() req: any) {
        return this.authService.login(req.user);
    }

    @Post('logout')
    @HttpCode(HttpStatus.OK)
    async logout(@Body('refresh_token') refreshToken: string) {
        return this.authService.logout(refreshToken);
    }

    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    async refresh(@Body('refresh_token') refreshToken: string) {
        return this.authService.refreshToken(refreshToken);
    }
}
