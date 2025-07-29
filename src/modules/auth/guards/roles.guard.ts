import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { EUserTypes } from 'src/common/constants/common.enum';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<EUserTypes[]>('roles', [context.getHandler(), context.getClass()]);

        if (!requiredRoles) {
            return true;
        }

        const { user } = context.switchToHttp().getRequest();

        if (!user) {
            throw new ForbiddenException('User not authenticated');
        }

        // Check if user has any of the required roles
        const hasRole = requiredRoles.some((requiredRole) => {
            // Check if user has the required role in their roles array
            return user.roles && user.roles.includes(requiredRole);
        });

        if (!hasRole) {
            throw new ForbiddenException('Insufficient permissions');
        }

        return true;
    }
}
