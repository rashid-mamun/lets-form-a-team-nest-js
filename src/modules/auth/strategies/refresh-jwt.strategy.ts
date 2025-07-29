import { Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class RefreshJwtStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
    constructor(private readonly configService: ConfigService) {
        const refreshSecret = configService.get<string>('JWT_REFRESH_SECRET') || configService.get<string>('JWT_SECRET');
        super({
            jwtFromRequest: (req: Request) => {
                return req.body?.refresh_token || null;
            },
            ignoreExpiration: false,
            secretOrKey: refreshSecret,
        });
    }

    async validate(payload: any) {
        return { userId: payload.sub, username: payload.username, roles: payload.roles };
    }
}
