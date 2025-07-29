import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { TokenService } from './token.service';
import { CreateUserDto } from 'src/common/dtos/create-user.dto';
import { LoginUserDto } from 'src/common/dtos/login-user.dto';
import { RedisService } from 'src/shared/redis/redis.service';
import { ApiResponseMessages } from 'src/common/constants/common.enum';
import { UserEntityService } from 'src/dataModules/user/user.service';

@Injectable()
export class AuthService {
    constructor(
        private readonly userService: UserService,
        private readonly tokenService: TokenService,
        private readonly redisService: RedisService,
        private readonly userEntityService: UserEntityService,
    ) {}

    async registerUser(createUserDto: CreateUserDto, requestingUserId?: number): Promise<{ access_token: string; refresh_token: string; message: string }> {
        try {
            const user = await this.userService.registerUser(createUserDto, requestingUserId);

            // Get user roles
            const userTypeMap = await this.userEntityService.getUserTypeMap({ filters: { userId: user.id } });
            const roles = userTypeMap ? [userTypeMap.userTypeId] : [];

            const payload = { username: user.username, sub: user.id, roles };
            return {
                message: 'User registered successfully',
                access_token: this.tokenService.generateAccessToken(payload),
                refresh_token: this.tokenService.generateRefreshToken(payload),
            };
        } catch (error) {
            throw new UnauthorizedException(error.message || ApiResponseMessages.UNAUTHORIZED_ACCESS);
        }
    }

    async login(loginUserDto: LoginUserDto): Promise<{ access_token: string; refresh_token: string; user: any }> {
        const user = await this.userService.validateUser(loginUserDto.username, loginUserDto.password);
        if (!user) {
            throw new UnauthorizedException(ApiResponseMessages.INVALID_CREDENTIALS);
        }

        // Get user roles
        const userTypeMap = await this.userEntityService.getUserTypeMap({ filters: { userId: user.id } });
        const roles = userTypeMap ? [userTypeMap.userTypeId] : [];

        const payload = { username: user.username, sub: user.id, roles };
        return {
            access_token: this.tokenService.generateAccessToken(payload),
            refresh_token: this.tokenService.generateRefreshToken(payload),
            user: {
                id: user.id,
                username: user.username,
                roles,
            },
        };
    }

    async logout(refreshToken: string): Promise<{ message: string }> {
        try {
            // Verify the token before blacklisting
            this.tokenService.verifyToken(refreshToken, true);
            await this.redisService.set(`blacklist:${refreshToken}`, 'true', 15 * 24 * 60 * 60); // 15 days
            return { message: 'Logout successful' };
        } catch (error) {
            throw new UnauthorizedException('Invalid refresh token');
        }
    }

    async refreshToken(refreshToken: string): Promise<{ access_token: string; refresh_token: string }> {
        try {
            const isBlacklisted = await this.redisService.get(`blacklist:${refreshToken}`);
            if (isBlacklisted) {
                throw new UnauthorizedException(ApiResponseMessages.INVALID_TOKEN);
            }
            const decoded = this.tokenService.verifyToken(refreshToken, true);
            const payload = { username: decoded.username, sub: decoded.sub, roles: decoded.roles };
            return {
                access_token: this.tokenService.generateAccessToken(payload),
                refresh_token: this.tokenService.generateRefreshToken(payload),
            };
        } catch (error) {
            throw new UnauthorizedException(ApiResponseMessages.INVALID_TOKEN);
        }
    }
}
