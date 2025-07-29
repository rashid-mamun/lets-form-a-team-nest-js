import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { TokenService } from './token.service';

describe('TokenService', () => {
    let service: TokenService;
    let jwtService: jest.Mocked<JwtService>;
    let configService: jest.Mocked<ConfigService>;

    const mockPayload = {
        username: 'testuser',
        sub: 1,
    };

    const mockTokens = {
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token',
    };

    beforeEach(async () => {
        const mockJwtService = {
            sign: jest.fn(),
            verify: jest.fn(),
        };

        const mockConfigService = {
            get: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                TokenService,
                {
                    provide: JwtService,
                    useValue: mockJwtService,
                },
                {
                    provide: ConfigService,
                    useValue: mockConfigService,
                },
            ],
        }).compile();

        service = module.get<TokenService>(TokenService);
        jwtService = module.get(JwtService);
        configService = module.get(ConfigService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('generateAccessToken', () => {
        it('should generate access token with default expiration', () => {
            configService.get.mockReturnValueOnce('jwt-secret');
            configService.get.mockReturnValueOnce('15m');
            jwtService.sign.mockReturnValue(mockTokens.access_token);

            const result = service.generateAccessToken(mockPayload);

            expect(result).toBe(mockTokens.access_token);
            expect(configService.get).toHaveBeenCalledWith('JWT_SECRET');
            expect(configService.get).toHaveBeenCalledWith('JWT_ACCESS_TOKEN_EXPIRATION', '15m');
            expect(jwtService.sign).toHaveBeenCalledWith(mockPayload, {
                secret: 'jwt-secret',
                expiresIn: '15m',
            });
        });

        it('should generate access token with custom expiration', () => {
            configService.get.mockReturnValueOnce('jwt-secret');
            configService.get.mockReturnValueOnce('30m');
            jwtService.sign.mockReturnValue(mockTokens.access_token);

            const result = service.generateAccessToken(mockPayload);

            expect(result).toBe(mockTokens.access_token);
            expect(jwtService.sign).toHaveBeenCalledWith(mockPayload, {
                secret: 'jwt-secret',
                expiresIn: '30m',
            });
        });
    });

    describe('generateRefreshToken', () => {
        it('should generate refresh token with separate secret', () => {
            configService.get.mockReturnValueOnce('refresh-secret');
            configService.get.mockReturnValueOnce('7d');
            jwtService.sign.mockReturnValue(mockTokens.refresh_token);

            const result = service.generateRefreshToken(mockPayload);

            expect(result).toBe(mockTokens.refresh_token);
            expect(configService.get).toHaveBeenCalledWith('JWT_REFRESH_SECRET');
            expect(configService.get).toHaveBeenCalledWith('JWT_REFRESH_TOKEN_EXPIRATION', '7d');
            expect(jwtService.sign).toHaveBeenCalledWith(mockPayload, {
                secret: 'refresh-secret',
                expiresIn: '7d',
            });
        });

        it('should generate refresh token with fallback to main secret', () => {
            configService.get.mockReturnValueOnce(undefined); // No refresh secret
            configService.get.mockReturnValueOnce('jwt-secret'); // Main secret
            configService.get.mockReturnValueOnce('7d');
            jwtService.sign.mockReturnValue(mockTokens.refresh_token);

            const result = service.generateRefreshToken(mockPayload);

            expect(result).toBe(mockTokens.refresh_token);
            expect(configService.get).toHaveBeenCalledWith('JWT_REFRESH_SECRET');
            expect(configService.get).toHaveBeenCalledWith('JWT_SECRET');
            expect(jwtService.sign).toHaveBeenCalledWith(mockPayload, {
                secret: 'jwt-secret',
                expiresIn: '7d',
            });
        });

        it('should generate refresh token with custom expiration', () => {
            configService.get.mockReturnValueOnce('refresh-secret');
            configService.get.mockReturnValueOnce('14d');
            jwtService.sign.mockReturnValue(mockTokens.refresh_token);

            const result = service.generateRefreshToken(mockPayload);

            expect(result).toBe(mockTokens.refresh_token);
            expect(jwtService.sign).toHaveBeenCalledWith(mockPayload, {
                secret: 'refresh-secret',
                expiresIn: '14d',
            });
        });
    });

    describe('verifyToken', () => {
        const token = 'valid-token';

        it('should verify access token with main secret', () => {
            const decodedPayload = { ...mockPayload, iat: 1234567890 };
            configService.get.mockReturnValue('jwt-secret');
            jwtService.verify.mockReturnValue(decodedPayload);

            const result = service.verifyToken(token);

            expect(result).toEqual(decodedPayload);
            expect(configService.get).toHaveBeenCalledWith('JWT_SECRET');
            expect(jwtService.verify).toHaveBeenCalledWith(token, {
                secret: 'jwt-secret',
            });
        });

        it('should verify refresh token with refresh secret', () => {
            const decodedPayload = { ...mockPayload, iat: 1234567890 };
            configService.get.mockReturnValueOnce('refresh-secret');
            jwtService.verify.mockReturnValue(decodedPayload);

            const result = service.verifyToken(token, true);

            expect(result).toEqual(decodedPayload);
            expect(configService.get).toHaveBeenCalledWith('JWT_REFRESH_SECRET');
            expect(jwtService.verify).toHaveBeenCalledWith(token, {
                secret: 'refresh-secret',
            });
        });

        it('should verify refresh token with fallback to main secret', () => {
            const decodedPayload = { ...mockPayload, iat: 1234567890 };
            configService.get.mockReturnValueOnce(undefined); // No refresh secret
            configService.get.mockReturnValueOnce('jwt-secret'); // Main secret
            jwtService.verify.mockReturnValue(decodedPayload);

            const result = service.verifyToken(token, true);

            expect(result).toEqual(decodedPayload);
            expect(configService.get).toHaveBeenCalledWith('JWT_REFRESH_SECRET');
            expect(configService.get).toHaveBeenCalledWith('JWT_SECRET');
            expect(jwtService.verify).toHaveBeenCalledWith(token, {
                secret: 'jwt-secret',
            });
        });

        it('should throw error when token verification fails', () => {
            const error = new Error('Invalid token');
            configService.get.mockReturnValue('jwt-secret');
            jwtService.verify.mockImplementation(() => {
                throw error;
            });

            expect(() => service.verifyToken(token)).toThrow(error);
            expect(jwtService.verify).toHaveBeenCalledWith(token, {
                secret: 'jwt-secret',
            });
        });

        it('should throw error when refresh token verification fails', () => {
            const error = new Error('Invalid refresh token');
            configService.get.mockReturnValueOnce('refresh-secret');
            jwtService.verify.mockImplementation(() => {
                throw error;
            });

            expect(() => service.verifyToken(token, true)).toThrow(error);
            expect(jwtService.verify).toHaveBeenCalledWith(token, {
                secret: 'refresh-secret',
            });
        });
    });

    describe('configuration handling', () => {
        it('should handle missing configuration gracefully', () => {
            configService.get.mockReturnValue(undefined);
            jwtService.sign.mockReturnValue(mockTokens.access_token);

            const result = service.generateAccessToken(mockPayload);

            expect(result).toBe(mockTokens.access_token);
            expect(jwtService.sign).toHaveBeenCalledWith(mockPayload, {
                secret: undefined,
                expiresIn: undefined,
            });
        });

        it('should use default expiration when not configured', () => {
            configService.get.mockReturnValueOnce('jwt-secret');
            configService.get.mockReturnValueOnce(undefined); // No expiration configured
            jwtService.sign.mockReturnValue(mockTokens.access_token);

            const result = service.generateAccessToken(mockPayload);

            expect(result).toBe(mockTokens.access_token);
            expect(jwtService.sign).toHaveBeenCalledWith(mockPayload, {
                secret: 'jwt-secret',
                expiresIn: undefined,
            });
        });
    });
});
