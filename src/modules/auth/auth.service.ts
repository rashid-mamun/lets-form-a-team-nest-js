import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { TokenService } from './token.service';
import { CreateUserDto } from 'src/common/dtos/create-user.dto';
import { LoginUserDto } from 'src/common/dtos/login-user.dto';
import { RedisService } from 'src/shared/redis/redis.service';
import { ApiResponseMessages } from 'src/common/constants/common.enum';

@Injectable()
export class AuthService {
    constructor(
        private readonly userService: UserService,
        private readonly tokenService: TokenService,
        private readonly redisService: RedisService,
    ) {}

    async registerUser(createUserDto: CreateUserDto): Promise<{ access_token: string; refresh_token: string; message: string }> {
        try {
            const user = await this.userService.registerUser(createUserDto);
            const payload = { username: user.username, sub: user.id };
            return {
                message: 'User registered successfully',
                access_token: this.tokenService.generateAccessToken(payload),
                refresh_token: this.tokenService.generateRefreshToken(payload),
            };
        } catch (error) {
            // console.log(error);
            throw new UnauthorizedException(error.message || ApiResponseMessages.UNAUTHORIZED_ACCESS);
        }
    }

    async login(loginUserDto: LoginUserDto): Promise<{ access_token: string; refresh_token: string }> {
        console.log('loginUserDto', loginUserDto);
        const user = await this.userService.validateUser(loginUserDto.username, loginUserDto.password);
        if (!user) {
            throw new UnauthorizedException(ApiResponseMessages.INVALID_CREDENTIALS);
        }
        const payload = { username: user.username, sub: user.id };
        return {
            access_token: this.tokenService.generateAccessToken(payload),
            refresh_token: this.tokenService.generateRefreshToken(payload),
        };
    }

    async logout(refreshToken: string): Promise<void> {
        try {
            await this.redisService.set(`blacklist:${refreshToken}`, 'true', 15 * 24 * 60 * 60); // 15 days
        } catch (error) {
            throw new Error('Failed to blacklist token');
        }
    }

    async refreshToken(refreshToken: string): Promise<{ access_token: string; refresh_token: string }> {
        try {
            const isBlacklisted = await this.redisService.get(`blacklist:${refreshToken}`);
            if (isBlacklisted) {
                throw new UnauthorizedException(ApiResponseMessages.INVALID_TOKEN);
            }
            const decoded = this.tokenService.verifyToken(refreshToken);
            const payload = { username: decoded.username, sub: decoded.sub };
            return {
                access_token: this.tokenService.generateAccessToken(payload),
                refresh_token: this.tokenService.generateRefreshToken(payload),
            };
        } catch (error) {
            throw new UnauthorizedException(ApiResponseMessages.INVALID_TOKEN);
        }
    }
}
