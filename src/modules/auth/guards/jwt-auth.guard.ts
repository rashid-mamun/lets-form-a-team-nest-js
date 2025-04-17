import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TokenExpiredError, JsonWebTokenError } from 'jsonwebtoken';
import { Observable } from 'rxjs';
import { TokenService } from '../token.service';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    constructor(private readonly tokenService: TokenService) {
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
                throw new UnauthorizedException('Access token has expired');
            } else if (info instanceof JsonWebTokenError) {
                throw new UnauthorizedException('Invalid access token');
            } else {
                console.error('Authentication Error:', err);
                console.error('Additional Info:', info); // Log additional info if available
                throw new UnauthorizedException();
            }
        }
        return user;
    }
}
