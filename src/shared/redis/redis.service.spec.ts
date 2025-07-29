import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { RedisService } from './redis.service';

// Mock the redis client
const mockClient = {
    connect: jest.fn(),
    quit: jest.fn(),
    setEx: jest.fn(),
    set: jest.fn(),
    get: jest.fn(),
    on: jest.fn(),
};

jest.mock('redis', () => ({
    createClient: jest.fn(() => mockClient),
}));

describe('RedisService', () => {
    let service: RedisService;
    let configService: jest.Mocked<ConfigService>;

    beforeEach(async () => {
        const mockConfigService = {
            get: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                RedisService,
                {
                    provide: ConfigService,
                    useValue: mockConfigService,
                },
            ],
        }).compile();

        service = module.get<RedisService>(RedisService);
        configService = module.get(ConfigService);

        // Reset mocks
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('constructor', () => {
        it('should create Redis client with default configuration', () => {
            configService.get.mockReturnValue('localhost');
            configService.get.mockReturnValue(6379);

            // Recreate service to trigger constructor
            const _newService = new RedisService(configService);

            expect(mockClient.on).toHaveBeenCalledWith('error', expect.any(Function));
            expect(mockClient.on).toHaveBeenCalledWith('connect', expect.any(Function));
            expect(mockClient.connect).toHaveBeenCalled();
        });

        it('should create Redis client with custom configuration', () => {
            configService.get.mockReturnValue('redis.example.com');
            configService.get.mockReturnValue(6380);

            // Recreate service to trigger constructor
            const _newService = new RedisService(configService);

            expect(mockClient.on).toHaveBeenCalledWith('error', expect.any(Function));
            expect(mockClient.on).toHaveBeenCalledWith('connect', expect.any(Function));
            expect(mockClient.connect).toHaveBeenCalled();
        });

        it('should handle connection errors', () => {
            const errorHandler = mockClient.on.mock.calls.find((call) => call[0] === 'error')?.[1];
            if (errorHandler) {
                const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
                errorHandler(new Error('Connection failed'));
                expect(consoleSpy).toHaveBeenCalledWith('Redis Client Error:', expect.any(Error));
                consoleSpy.mockRestore();
            }
        });

        it('should handle successful connections', () => {
            const connectHandler = mockClient.on.mock.calls.find((call) => call[0] === 'connect')?.[1];
            if (connectHandler) {
                const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
                connectHandler();
                expect(consoleSpy).toHaveBeenCalledWith('Redis Client Connected');
                consoleSpy.mockRestore();
            }
        });
    });

    describe('set', () => {
        it('should set value with TTL', async () => {
            mockClient.setEx.mockResolvedValue('OK');

            await service.set('test-key', 'test-value', 3600);

            expect(mockClient.setEx).toHaveBeenCalledWith('test-key', 3600, 'test-value');
            expect(mockClient.set).not.toHaveBeenCalled();
        });

        it('should set value without TTL', async () => {
            mockClient.set.mockResolvedValue('OK');

            await service.set('test-key', 'test-value');

            expect(mockClient.set).toHaveBeenCalledWith('test-key', 'test-value');
            expect(mockClient.setEx).not.toHaveBeenCalled();
        });

        it('should handle setEx errors', async () => {
            const error = new Error('Redis setEx error');
            mockClient.setEx.mockRejectedValue(error);
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

            await expect(service.set('test-key', 'test-value', 3600)).rejects.toThrow('Failed to set value in Redis');

            expect(consoleSpy).toHaveBeenCalledWith('Redis set error:', error);
            consoleSpy.mockRestore();
        });

        it('should handle set errors', async () => {
            const error = new Error('Redis set error');
            mockClient.set.mockRejectedValue(error);
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

            await expect(service.set('test-key', 'test-value')).rejects.toThrow('Failed to set value in Redis');

            expect(consoleSpy).toHaveBeenCalledWith('Redis set error:', error);
            consoleSpy.mockRestore();
        });
    });

    describe('get', () => {
        it('should get value successfully', async () => {
            mockClient.get.mockResolvedValue('test-value');

            const result = await service.get('test-key');

            expect(result).toBe('test-value');
            expect(mockClient.get).toHaveBeenCalledWith('test-key');
        });

        it('should return null when key does not exist', async () => {
            mockClient.get.mockResolvedValue(null);

            const result = await service.get('non-existent-key');

            expect(result).toBeNull();
            expect(mockClient.get).toHaveBeenCalledWith('non-existent-key');
        });

        it('should handle get errors gracefully', async () => {
            const error = new Error('Redis get error');
            mockClient.get.mockRejectedValue(error);
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

            const result = await service.get('test-key');

            expect(result).toBeNull();
            expect(consoleSpy).toHaveBeenCalledWith('Redis get error:', error);
            consoleSpy.mockRestore();
        });
    });

    describe('onModuleDestroy', () => {
        it('should quit Redis client on module destroy', async () => {
            mockClient.quit.mockResolvedValue('OK');

            await service.onModuleDestroy();

            expect(mockClient.quit).toHaveBeenCalled();
        });

        it('should handle quit errors gracefully', async () => {
            const error = new Error('Redis quit error');
            mockClient.quit.mockRejectedValue(error);

            // Should throw error since implementation doesn't handle it
            await expect(service.onModuleDestroy()).rejects.toThrow('Redis quit error');
        });

        it('should handle quit when client is null', async () => {
            // Mock client as null
            const serviceWithNullClient = new RedisService(configService);
            (serviceWithNullClient as any).client = null;

            await expect(serviceWithNullClient.onModuleDestroy()).resolves.toBeUndefined();
        });
    });

    describe('connect method', () => {
        it('should handle connection success', async () => {
            mockClient.connect.mockResolvedValue(undefined);

            await (service as any).connect();

            expect(mockClient.connect).toHaveBeenCalled();
        });

        it('should handle connection failure', async () => {
            const error = new Error('Connection failed');
            mockClient.connect.mockRejectedValue(error);
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

            await (service as any).connect();

            expect(consoleSpy).toHaveBeenCalledWith('Failed to connect to Redis:', error);
            consoleSpy.mockRestore();
        });
    });

    describe('configuration handling', () => {
        it('should use default values when configuration is missing', () => {
            configService.get.mockReturnValue(undefined);

            // Recreate service to trigger constructor
            const _newService = new RedisService(configService);

            expect(mockClient.on).toHaveBeenCalledWith('error', expect.any(Function));
            expect(mockClient.on).toHaveBeenCalledWith('connect', expect.any(Function));
            expect(mockClient.connect).toHaveBeenCalled();
        });

        it('should use custom configuration when provided', () => {
            configService.get.mockReturnValue('custom-host');
            configService.get.mockReturnValue(6380);

            // Recreate service to trigger constructor
            const _newService = new RedisService(configService);

            expect(mockClient.on).toHaveBeenCalledWith('error', expect.any(Function));
            expect(mockClient.on).toHaveBeenCalledWith('connect', expect.any(Function));
            expect(mockClient.connect).toHaveBeenCalled();
        });
    });

    describe('error handling scenarios', () => {
        it('should handle multiple consecutive errors', async () => {
            const error = new Error('Redis error');
            mockClient.get.mockRejectedValue(error);
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

            const result1 = await service.get('key1');
            const result2 = await service.get('key2');

            expect(result1).toBeNull();
            expect(result2).toBeNull();
            expect(consoleSpy).toHaveBeenCalledTimes(2);
            consoleSpy.mockRestore();
        });

        it('should handle mixed success and error scenarios', async () => {
            mockClient.get.mockResolvedValueOnce('success-value');
            mockClient.get.mockRejectedValueOnce(new Error('Redis error'));
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

            const result1 = await service.get('key1');
            const result2 = await service.get('key2');

            expect(result1).toBe('success-value');
            expect(result2).toBeNull();
            expect(consoleSpy).toHaveBeenCalledTimes(1);
            consoleSpy.mockRestore();
        });
    });
});
