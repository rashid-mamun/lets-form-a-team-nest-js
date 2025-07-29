import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { TokenService } from './token.service';
import { RedisService } from '../../shared/redis/redis.service';
import { UserEntityService } from '../../dataModules/user/user.service';
import { CreateUserDto } from '../../common/dtos/create-user.dto';
import { LoginUserDto } from '../../common/dtos/login-user.dto';
import { ApiResponseMessages } from '../../common/constants/common.enum';

describe('AuthService', () => {
    let service: AuthService;
    let userService: jest.Mocked<UserService>;
    let tokenService: jest.Mocked<TokenService>;
    let redisService: jest.Mocked<RedisService>;
    let userEntityService: jest.Mocked<UserEntityService>;

    const mockUser = {
        id: 1,
        username: 'testuser',
        profile: {
            id: 1,
            name: 'Test User',
            email: 'test@example.com',
        },
    };

    const mockTokens = {
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token',
    };

    beforeEach(async () => {
        const mockUserService = {
            registerUser: jest.fn(),
            validateUser: jest.fn(),
        };

        const mockTokenService = {
            generateAccessToken: jest.fn(),
            generateRefreshToken: jest.fn(),
            verifyToken: jest.fn(),
        };

        const mockRedisService = {
            set: jest.fn(),
            get: jest.fn(),
        };

        const mockUserEntityService = {
            getUserTypeMap: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                {
                    provide: UserService,
                    useValue: mockUserService,
                },
                {
                    provide: TokenService,
                    useValue: mockTokenService,
                },
                {
                    provide: RedisService,
                    useValue: mockRedisService,
                },
                {
                    provide: UserEntityService,
                    useValue: mockUserEntityService,
                },
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);
        userService = module.get(UserService);
        tokenService = module.get(TokenService);
        redisService = module.get(RedisService);
        userEntityService = module.get(UserEntityService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('registerUser', () => {
        const createUserDto: CreateUserDto = {
            username: 'newuser',
            password: 'password123',
            name: 'New User',
            email: 'newuser@example.com',
            contactNumber: '1234567890',
            userTypeId: 2,
            userId: 1,
        };

        it('should register a user successfully', async () => {
            const registeredUser = {
                id: 2,
                username: 'newuser',
            };

            const mockUserTypeMap = {
                id: 1,
                userId: 2,
                userTypeId: 2,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            userService.registerUser.mockResolvedValue(registeredUser);
            userEntityService.getUserTypeMap.mockResolvedValue(mockUserTypeMap as any);
            tokenService.generateAccessToken.mockReturnValue(mockTokens.access_token);
            tokenService.generateRefreshToken.mockReturnValue(mockTokens.refresh_token);

            const result = await service.registerUser(createUserDto);

            expect(result).toEqual({
                message: 'User registered successfully',
                access_token: mockTokens.access_token,
                refresh_token: mockTokens.refresh_token,
            });
            expect(userService.registerUser).toHaveBeenCalledWith(createUserDto, undefined);
            expect(userEntityService.getUserTypeMap).toHaveBeenCalledWith({ filters: { userId: registeredUser.id } });
            expect(tokenService.generateAccessToken).toHaveBeenCalledWith({
                username: registeredUser.username,
                sub: registeredUser.id,
                roles: [mockUserTypeMap.userTypeId],
            });
            expect(tokenService.generateRefreshToken).toHaveBeenCalledWith({
                username: registeredUser.username,
                sub: registeredUser.id,
                roles: [mockUserTypeMap.userTypeId],
            });
        });

        it('should register a user with requesting user ID', async () => {
            const registeredUser = {
                id: 2,
                username: 'newuser',
            };

            const mockUserTypeMap = {
                id: 1,
                userId: 2,
                userTypeId: 2,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            userService.registerUser.mockResolvedValue(registeredUser);
            userEntityService.getUserTypeMap.mockResolvedValue(mockUserTypeMap as any);
            tokenService.generateAccessToken.mockReturnValue(mockTokens.access_token);
            tokenService.generateRefreshToken.mockReturnValue(mockTokens.refresh_token);

            const result = await service.registerUser(createUserDto, 1);

            expect(result).toEqual({
                message: 'User registered successfully',
                access_token: mockTokens.access_token,
                refresh_token: mockTokens.refresh_token,
            });
            expect(userService.registerUser).toHaveBeenCalledWith(createUserDto, 1);
        });

        it('should throw UnauthorizedException when user registration fails', async () => {
            const errorMessage = 'Registration failed';
            userService.registerUser.mockRejectedValue(new Error(errorMessage));

            await expect(service.registerUser(createUserDto)).rejects.toThrow(new UnauthorizedException(errorMessage));
        });

        it('should throw UnauthorizedException with default message when error has no message', async () => {
            userService.registerUser.mockRejectedValue(new Error());

            await expect(service.registerUser(createUserDto)).rejects.toThrow(new UnauthorizedException(ApiResponseMessages.UNAUTHORIZED_ACCESS));
        });
    });

    describe('login', () => {
        const loginUserDto: LoginUserDto = {
            username: 'testuser',
            password: 'password123',
        };

        it('should login successfully with valid credentials', async () => {
            const mockUserTypeMap = {
                id: 1,
                userId: 1,
                userTypeId: 1,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            userService.validateUser.mockResolvedValue(mockUser);
            userEntityService.getUserTypeMap.mockResolvedValue(mockUserTypeMap as any);
            tokenService.generateAccessToken.mockReturnValue(mockTokens.access_token);
            tokenService.generateRefreshToken.mockReturnValue(mockTokens.refresh_token);

            const result = await service.login(loginUserDto);

            expect(result).toEqual({
                access_token: mockTokens.access_token,
                refresh_token: mockTokens.refresh_token,
                user: {
                    id: mockUser.id,
                    username: mockUser.username,
                    roles: [mockUserTypeMap.userTypeId],
                },
            });
            expect(userService.validateUser).toHaveBeenCalledWith(loginUserDto.username, loginUserDto.password);
            expect(userEntityService.getUserTypeMap).toHaveBeenCalledWith({ filters: { userId: mockUser.id } });
            expect(tokenService.generateAccessToken).toHaveBeenCalledWith({
                username: mockUser.username,
                sub: mockUser.id,
                roles: [mockUserTypeMap.userTypeId],
            });
            expect(tokenService.generateRefreshToken).toHaveBeenCalledWith({
                username: mockUser.username,
                sub: mockUser.id,
                roles: [mockUserTypeMap.userTypeId],
            });
        });

        it('should throw UnauthorizedException with invalid credentials', async () => {
            userService.validateUser.mockResolvedValue(null);

            await expect(service.login(loginUserDto)).rejects.toThrow(new UnauthorizedException(ApiResponseMessages.INVALID_CREDENTIALS));
            expect(userService.validateUser).toHaveBeenCalledWith(loginUserDto.username, loginUserDto.password);
        });
    });

    describe('logout', () => {
        const refreshToken = 'valid-refresh-token';

        it('should logout successfully', async () => {
            tokenService.verifyToken.mockReturnValue({ username: 'testuser', sub: 1 });
            redisService.set.mockResolvedValue(undefined);

            const result = await service.logout(refreshToken);

            expect(result).toEqual({ message: 'Logout successful' });
            expect(tokenService.verifyToken).toHaveBeenCalledWith(refreshToken, true);
            expect(redisService.set).toHaveBeenCalledWith(`blacklist:${refreshToken}`, 'true', 15 * 24 * 60 * 60);
        });

        it('should throw UnauthorizedException when token verification fails', async () => {
            tokenService.verifyToken.mockImplementation(() => {
                throw new Error('Invalid token');
            });

            await expect(service.logout(refreshToken)).rejects.toThrow(new UnauthorizedException('Invalid refresh token'));
            expect(tokenService.verifyToken).toHaveBeenCalledWith(refreshToken, true);
            expect(redisService.set).not.toHaveBeenCalled();
        });

        it('should throw UnauthorizedException when Redis operation fails', async () => {
            tokenService.verifyToken.mockReturnValue({ username: 'testuser', sub: 1 });
            redisService.set.mockRejectedValue(new Error('Redis error'));

            await expect(service.logout(refreshToken)).rejects.toThrow(new UnauthorizedException('Invalid refresh token'));
        });
    });

    describe('refreshToken', () => {
        const refreshToken = 'valid-refresh-token';
        const decodedToken = {
            username: 'testuser',
            sub: 1,
            roles: [1],
        };

        it('should refresh token successfully', async () => {
            redisService.get.mockResolvedValue(null);
            tokenService.verifyToken.mockReturnValue(decodedToken);
            tokenService.generateAccessToken.mockReturnValue(mockTokens.access_token);
            tokenService.generateRefreshToken.mockReturnValue(mockTokens.refresh_token);

            const result = await service.refreshToken(refreshToken);

            expect(result).toEqual({
                access_token: mockTokens.access_token,
                refresh_token: mockTokens.refresh_token,
            });
            expect(redisService.get).toHaveBeenCalledWith(`blacklist:${refreshToken}`);
            expect(tokenService.verifyToken).toHaveBeenCalledWith(refreshToken, true);
            expect(tokenService.generateAccessToken).toHaveBeenCalledWith(decodedToken);
            expect(tokenService.generateRefreshToken).toHaveBeenCalledWith(decodedToken);
        });

        it('should throw UnauthorizedException when token is blacklisted', async () => {
            redisService.get.mockResolvedValue('true');

            await expect(service.refreshToken(refreshToken)).rejects.toThrow(new UnauthorizedException(ApiResponseMessages.INVALID_TOKEN));
            expect(redisService.get).toHaveBeenCalledWith(`blacklist:${refreshToken}`);
            expect(tokenService.verifyToken).not.toHaveBeenCalled();
        });

        it('should throw UnauthorizedException when token verification fails', async () => {
            redisService.get.mockResolvedValue(null);
            tokenService.verifyToken.mockImplementation(() => {
                throw new Error('Invalid token');
            });

            await expect(service.refreshToken(refreshToken)).rejects.toThrow(new UnauthorizedException(ApiResponseMessages.INVALID_TOKEN));
            expect(redisService.get).toHaveBeenCalledWith(`blacklist:${refreshToken}`);
            expect(tokenService.verifyToken).toHaveBeenCalledWith(refreshToken, true);
        });
    });
});
