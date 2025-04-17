import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { TokenExpiredError, JsonWebTokenError } from 'jsonwebtoken';
import { Observable } from 'rxjs';

@Injectable()
export class RefreshJwtGuard extends AuthGuard('jwt-refresh') {
    constructor(
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ) {
        super();
    }

    /**
     * Optional: Override canActivate if you need custom logic before activation.
     * @param context - The execution context.
     * @returns A boolean, a Promise that resolves to a boolean, or an Observable that resolves to a boolean indicating whether the request can proceed.
     */
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        return super.canActivate(context);
    }

    /**
     * Handles the request and checks for authentication errors.
     * @param err - The error object, if any.
     * @param user - The user object if authenticated.
     * @param info - Additional info, possibly containing token error information.
     * @throws UnauthorizedException if there's an error or the user is not authenticated.
     * @returns The authenticated user object.
     */
    handleRequest(err: any, user: any, info: any): any {
        if (err || !user) {
            if (info instanceof TokenExpiredError) {
                throw new UnauthorizedException('Refresh token has expired');
            } else if (info instanceof JsonWebTokenError) {
                throw new UnauthorizedException('Invalid refresh token');
            } else {
                throw new UnauthorizedException();
            }
        }
        return user;
    }
}
