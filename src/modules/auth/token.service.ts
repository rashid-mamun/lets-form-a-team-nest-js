import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class TokenService {
    constructor(
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ) {}

    generateAccessToken(payload: any): string {
        return this.jwtService.sign(payload, {
            secret: this.configService.get<string>('JWT_SECRET'),
            expiresIn: this.configService.get<string>('JWT_ACCESS_TOKEN_EXPIRATION', '15m'),
        });
    }

    generateRefreshToken(payload: any): string {
        const refreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET') || this.configService.get<string>('JWT_SECRET');
        return this.jwtService.sign(payload, {
            secret: refreshSecret,
            expiresIn: this.configService.get<string>('JWT_REFRESH_TOKEN_EXPIRATION', '7d'),
        });
    }

    verifyToken(token: string, isRefreshToken: boolean = false): any {
        const secret = isRefreshToken
            ? this.configService.get<string>('JWT_REFRESH_SECRET') || this.configService.get<string>('JWT_SECRET')
            : this.configService.get<string>('JWT_SECRET');

        return this.jwtService.verify(token, {
            secret,
        });
    }
}
