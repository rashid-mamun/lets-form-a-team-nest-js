import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { RolesGuard } from './roles.guard';
import { EUserTypes } from '../../../common/constants/common.enum';

describe('RolesGuard', () => {
    let guard: RolesGuard;
    let reflector: jest.Mocked<Reflector>;

    beforeEach(async () => {
        const mockReflector = {
            getAllAndOverride: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                RolesGuard,
                {
                    provide: Reflector,
                    useValue: mockReflector,
                },
            ],
        }).compile();

        guard = module.get<RolesGuard>(RolesGuard);
        reflector = module.get(Reflector);
    });

    it('should be defined', () => {
        expect(guard).toBeDefined();
    });

    describe('canActivate', () => {
        let mockContext: jest.Mocked<ExecutionContext>;

        beforeEach(() => {
            mockContext = {
                switchToHttp: jest.fn().mockReturnValue({
                    getRequest: jest.fn().mockReturnValue({
                        user: { userId: 1, username: 'testuser', roles: [EUserTypes.SUPER_ADMIN] },
                    }),
                }),
                getHandler: jest.fn().mockReturnValue({}),
                getClass: jest.fn().mockReturnValue({}),
            } as any;
        });

        it('should allow access when no roles are required', () => {
            reflector.getAllAndOverride.mockReturnValue(undefined);

            const result = guard.canActivate(mockContext);

            expect(result).toBe(true);
            expect(reflector.getAllAndOverride).toHaveBeenCalledWith('roles', [mockContext.getHandler(), mockContext.getClass()]);
        });

        it('should allow access when user has required role', () => {
            reflector.getAllAndOverride.mockReturnValue([EUserTypes.SUPER_ADMIN]);

            const result = guard.canActivate(mockContext);

            expect(result).toBe(true);
        });

        it('should allow access when user has one of multiple required roles', () => {
            reflector.getAllAndOverride.mockReturnValue([EUserTypes.MANAGER, EUserTypes.EMPLOYEE]);
            mockContext.switchToHttp().getRequest().user.roles = [EUserTypes.MANAGER];

            const result = guard.canActivate(mockContext);

            expect(result).toBe(true);
        });

        it('should deny access when user does not have required role', () => {
            reflector.getAllAndOverride.mockReturnValue([EUserTypes.MANAGER]);
            mockContext.switchToHttp().getRequest().user.roles = [EUserTypes.EMPLOYEE];

            expect(() => guard.canActivate(mockContext)).toThrow(ForbiddenException);
        });

        it('should deny access when user has no roles', () => {
            reflector.getAllAndOverride.mockReturnValue([EUserTypes.SUPER_ADMIN]);
            mockContext.switchToHttp().getRequest().user.roles = [];

            expect(() => guard.canActivate(mockContext)).toThrow(ForbiddenException);
        });

        it('should deny access when user is not authenticated', () => {
            reflector.getAllAndOverride.mockReturnValue([EUserTypes.SUPER_ADMIN]);
            mockContext.switchToHttp().getRequest().user = null;

            expect(() => guard.canActivate(mockContext)).toThrow(ForbiddenException);
        });

        it('should deny access when user object is missing', () => {
            reflector.getAllAndOverride.mockReturnValue([EUserTypes.SUPER_ADMIN]);
            mockContext.switchToHttp().getRequest().user = undefined;

            expect(() => guard.canActivate(mockContext)).toThrow(ForbiddenException);
        });

        it('should throw ForbiddenException with correct message when user not authenticated', () => {
            reflector.getAllAndOverride.mockReturnValue([EUserTypes.SUPER_ADMIN]);
            mockContext.switchToHttp().getRequest().user = null;

            expect(() => guard.canActivate(mockContext)).toThrow('User not authenticated');
        });

        it('should throw ForbiddenException with correct message when insufficient permissions', () => {
            reflector.getAllAndOverride.mockReturnValue([EUserTypes.MANAGER]);
            mockContext.switchToHttp().getRequest().user.roles = [EUserTypes.EMPLOYEE];

            expect(() => guard.canActivate(mockContext)).toThrow('Insufficient permissions');
        });
    });

    describe('role checking logic', () => {
        let mockContext: jest.Mocked<ExecutionContext>;

        beforeEach(() => {
            mockContext = {
                switchToHttp: jest.fn().mockReturnValue({
                    getRequest: jest.fn().mockReturnValue({
                        user: { userId: 1, username: 'testuser', roles: [EUserTypes.SUPER_ADMIN] },
                    }),
                }),
                getHandler: jest.fn().mockReturnValue({}),
                getClass: jest.fn().mockReturnValue({}),
            } as any;
        });

        it('should allow super admin access to super admin role', () => {
            reflector.getAllAndOverride.mockReturnValue([EUserTypes.SUPER_ADMIN]);
            const result = guard.canActivate(mockContext);
            expect(result).toBe(true);
        });

        it('should allow manager access to manager role', () => {
            reflector.getAllAndOverride.mockReturnValue([EUserTypes.MANAGER]);
            mockContext.switchToHttp().getRequest().user.roles = [EUserTypes.MANAGER];
            const result = guard.canActivate(mockContext);
            expect(result).toBe(true);
        });

        it('should allow employee access to employee role', () => {
            reflector.getAllAndOverride.mockReturnValue([EUserTypes.EMPLOYEE]);
            mockContext.switchToHttp().getRequest().user.roles = [EUserTypes.EMPLOYEE];
            const result = guard.canActivate(mockContext);
            expect(result).toBe(true);
        });

        it('should deny employee access to manager role', () => {
            reflector.getAllAndOverride.mockReturnValue([EUserTypes.MANAGER]);
            mockContext.switchToHttp().getRequest().user.roles = [EUserTypes.EMPLOYEE];

            expect(() => guard.canActivate(mockContext)).toThrow(ForbiddenException);
        });

        it('should deny manager access to super admin role', () => {
            reflector.getAllAndOverride.mockReturnValue([EUserTypes.SUPER_ADMIN]);
            mockContext.switchToHttp().getRequest().user.roles = [EUserTypes.MANAGER];

            expect(() => guard.canActivate(mockContext)).toThrow(ForbiddenException);
        });
    });

    describe('edge cases', () => {
        let mockContext: jest.Mocked<ExecutionContext>;

        beforeEach(() => {
            mockContext = {
                switchToHttp: jest.fn().mockReturnValue({
                    getRequest: jest.fn().mockReturnValue({
                        user: { userId: 1, username: 'testuser', roles: [EUserTypes.SUPER_ADMIN] },
                    }),
                }),
                getHandler: jest.fn().mockReturnValue({}),
                getClass: jest.fn().mockReturnValue({}),
            } as any;
        });

        it('should handle empty roles array', () => {
            reflector.getAllAndOverride.mockReturnValue([EUserTypes.SUPER_ADMIN]);
            mockContext.switchToHttp().getRequest().user.roles = [];

            expect(() => guard.canActivate(mockContext)).toThrow(ForbiddenException);
        });

        it('should handle null roles', () => {
            reflector.getAllAndOverride.mockReturnValue(null);

            const result = guard.canActivate(mockContext);

            expect(result).toBe(true);
        });

        it('should handle undefined roles', () => {
            reflector.getAllAndOverride.mockReturnValue(undefined);

            const result = guard.canActivate(mockContext);

            expect(result).toBe(true);
        });

        it('should handle user with null roles', () => {
            reflector.getAllAndOverride.mockReturnValue([EUserTypes.SUPER_ADMIN]);
            mockContext.switchToHttp().getRequest().user.roles = null;

            expect(() => guard.canActivate(mockContext)).toThrow(ForbiddenException);
        });

        it('should handle user with undefined roles', () => {
            reflector.getAllAndOverride.mockReturnValue([EUserTypes.SUPER_ADMIN]);
            mockContext.switchToHttp().getRequest().user.roles = undefined;

            expect(() => guard.canActivate(mockContext)).toThrow(ForbiddenException);
        });
    });
});
