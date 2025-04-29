import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards, UseInterceptors, ClassSerializerInterceptor } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDto } from 'src/common/dtos/login-user.dto';
import { CreateUserDto } from 'src/common/dtos/create-user.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RefreshJwtGuard } from './guards/refresh-jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SWAGGER_API_TAGS } from 'src/common/constants/common.constant';
import { CommonErrorResponse } from 'src/common/serializers/error.serializer';

@Controller('auth')
@ApiTags(SWAGGER_API_TAGS.AUTH)
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {
    constructor(private authService: AuthService) {}

    @Post('signup')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Register a new user' })
    @ApiResponse({ status: 201, description: 'User registered successfully' })
    @ApiResponse({ status: 400, type: CommonErrorResponse, description: 'Invalid input' })
    async signup(@Body() createUserDto: CreateUserDto) {
        return this.authService.registerUser(createUserDto);
    }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    @UseGuards(LocalAuthGuard)
    @ApiOperation({ summary: 'Log in a user' })
    @ApiResponse({ status: 200, description: 'Login successful with tokens' })
    @ApiResponse({ status: 401, type: CommonErrorResponse, description: 'Invalid credentials' })
    async login(@Body() loginUserDto: LoginUserDto) {
        return this.authService.login(loginUserDto);
    }

    @Post('logout')
    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Log out a user' })
    @ApiResponse({ status: 200, description: 'Logout successful' })
    async logout(@Body('refresh_token') refreshToken: string) {
        return this.authService.logout(refreshToken);
    }

    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    @UseGuards(RefreshJwtGuard)
    @ApiOperation({ summary: 'Refresh access token' })
    @ApiResponse({ status: 200, description: 'Token refreshed successfully' })
    @ApiResponse({ status: 401, type: CommonErrorResponse, description: 'Invalid refresh token' })
    async refreshToken(@Body('refresh_token') refreshToken: string) {
        return this.authService.refreshToken(refreshToken);
    }
}
