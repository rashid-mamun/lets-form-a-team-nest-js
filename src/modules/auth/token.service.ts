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
        return this.jwtService.sign(payload);
    }

    generateRefreshToken(payload: any): string {
        return this.jwtService.sign(payload, {
            secret: this.configService.get<string>('JWT_SECRET'),
            expiresIn: this.configService.get<string>('JWT_REFRESH_TOKEN_EXPIRATION'),
        });
    }

    verifyToken(token: string): any {
        return this.jwtService.verify(token, {
            secret: this.configService.get<string>('JWT_SECRET'),
        });
    }
}
