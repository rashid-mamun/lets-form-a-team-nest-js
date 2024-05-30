import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TokenService {
    constructor(
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ) { }

    generateAccessToken(payload: any) {
        return this.jwtService.sign(payload, {
            secret: this.configService.get<string>('JWT_SECRET'),
            expiresIn: this.configService.get<string>('JWT_ACCESS_TOKEN_EXPIRATION'),
        });
    }

    generateRefreshToken(payload: any) {
        return this.jwtService.sign(payload, {
            secret: this.configService.get<string>('JWT_SECRET'),
            expiresIn: this.configService.get<string>('JWT_REFRESH_TOKEN_EXPIRATION'),
        });
    }

    verifyToken(token: string) {
        return this.jwtService.verify(token, {
            secret: this.configService.get<string>('JWT_SECRET'),
        });
    }
}
