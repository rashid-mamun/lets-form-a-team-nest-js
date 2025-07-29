import { Test, TestingModule } from '@nestjs/testing';
import { SeederService } from './seeder.service';
import { DataSource } from 'typeorm';
import { CentralLogger } from '../../shared/loggerServices/centralLogger.service';
import { UserEntityService } from '../../dataModules/user/user.service';
import { EUserTypes } from '../../common/constants/common.enum';

describe('SeederService', () => {
    let service: SeederService;
    let dataSource: jest.Mocked<DataSource>;
    let _userEntityService: jest.Mocked<UserEntityService>;
    let logger: jest.Mocked<CentralLogger>;

    beforeEach(async () => {
        const mockDataSource = {
            createQueryRunner: jest.fn(),
        };

        const mockUserEntityService = {
            // Add any methods if needed
        };

        const mockLogger = {
            info: jest.fn(),
            error: jest.fn(),
            warn: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                SeederService,
                {
                    provide: DataSource,
                    useValue: mockDataSource,
                },
                {
                    provide: UserEntityService,
                    useValue: mockUserEntityService,
                },
                {
                    provide: CentralLogger,
                    useValue: mockLogger,
                },
            ],
        }).compile();

        service = module.get<SeederService>(SeederService);
        dataSource = module.get(DataSource);
        const _userEntityService = module.get(UserEntityService);
        logger = module.get(CentralLogger);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('seedDatabase', () => {
        it('should seed database successfully', async () => {
            const mockQueryRunner = {
                connect: jest.fn(),
                startTransaction: jest.fn(),
                commitTransaction: jest.fn(),
                rollbackTransaction: jest.fn(),
                release: jest.fn(),
                manager: {
                    findOne: jest
                        .fn()
                        .mockResolvedValueOnce(null) // First call for user type check (Super Admin)
                        .mockResolvedValueOnce(null) // Second call for user type check (Manager)
                        .mockResolvedValueOnce(null) // Third call for user type check (Employee)
                        .mockResolvedValueOnce(null) // Fourth call for user check
                        .mockResolvedValueOnce({ id: 1, userTypeId: EUserTypes.SUPER_ADMIN }), // Fifth call for user type lookup
                    create: jest.fn().mockImplementation((entity, data) => ({ ...data, id: 1, userTypeId: EUserTypes.SUPER_ADMIN })),
                    save: jest.fn().mockImplementation((entity) => Promise.resolve(entity)),
                },
            };

            dataSource.createQueryRunner.mockReturnValue(mockQueryRunner as any);

            const result = await service.seedDatabase();

            expect(result).toBe(true);
            expect(mockQueryRunner.startTransaction).toHaveBeenCalled();
            expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
            expect(mockQueryRunner.release).toHaveBeenCalled();
            expect(logger.info).toHaveBeenCalledWith('Starting database seeding transaction');
        });

        it('should handle existing data gracefully', async () => {
            const mockQueryRunner = {
                connect: jest.fn(),
                startTransaction: jest.fn(),
                commitTransaction: jest.fn(),
                rollbackTransaction: jest.fn(),
                release: jest.fn(),
                manager: {
                    findOne: jest.fn().mockResolvedValue({ id: 1, userType: 'SUPER_ADMIN' }),
                    create: jest.fn().mockImplementation((entity, data) => ({ ...data, id: 1 })),
                    save: jest.fn().mockImplementation((entity) => Promise.resolve(entity)),
                },
            };

            dataSource.createQueryRunner.mockReturnValue(mockQueryRunner as any);

            const result = await service.seedDatabase();

            expect(result).toBe(true);
            expect(mockQueryRunner.startTransaction).toHaveBeenCalled();
            expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
            expect(mockQueryRunner.release).toHaveBeenCalled();
            expect(logger.info).toHaveBeenCalledWith('Starting database seeding transaction');
        });

        it('should handle database errors gracefully', async () => {
            const mockQueryRunner = {
                connect: jest.fn(),
                startTransaction: jest.fn(),
                rollbackTransaction: jest.fn(),
                release: jest.fn(),
                manager: {
                    findOne: jest.fn().mockRejectedValue(new Error('Database error')),
                },
            };

            dataSource.createQueryRunner.mockReturnValue(mockQueryRunner as any);

            await expect(service.seedDatabase()).rejects.toThrow('Database seeding failed');
            expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
            expect(mockQueryRunner.release).toHaveBeenCalled();
            expect(logger.error).toHaveBeenCalledWith('Seeding transaction failed', expect.any(Error));
        });

        it('should create user types if they do not exist', async () => {
            const mockQueryRunner = {
                connect: jest.fn(),
                startTransaction: jest.fn(),
                commitTransaction: jest.fn(),
                rollbackTransaction: jest.fn(),
                release: jest.fn(),
                manager: {
                    findOne: jest
                        .fn()
                        .mockResolvedValueOnce(null) // First call for user type check (Super Admin)
                        .mockResolvedValueOnce(null) // Second call for user type check (Manager)
                        .mockResolvedValueOnce(null) // Third call for user type check (Employee)
                        .mockResolvedValueOnce(null) // Fourth call for user check
                        .mockResolvedValueOnce({ id: 1, userTypeId: EUserTypes.SUPER_ADMIN }), // Fifth call for user type lookup
                    create: jest.fn().mockImplementation((entity, data) => ({ ...data, id: 1, userTypeId: EUserTypes.SUPER_ADMIN })),
                    save: jest.fn().mockImplementation((entity) => Promise.resolve(entity)),
                },
            };

            dataSource.createQueryRunner.mockReturnValue(mockQueryRunner as any);

            const result = await service.seedDatabase();

            expect(result).toBe(true);
            expect(mockQueryRunner.manager.findOne).toHaveBeenCalled();
            expect(mockQueryRunner.manager.create).toHaveBeenCalled();
            expect(mockQueryRunner.manager.save).toHaveBeenCalled();
        });

        it('should create super admin user if it does not exist', async () => {
            const mockQueryRunner = {
                connect: jest.fn(),
                startTransaction: jest.fn(),
                commitTransaction: jest.fn(),
                rollbackTransaction: jest.fn(),
                release: jest.fn(),
                manager: {
                    findOne: jest
                        .fn()
                        .mockResolvedValueOnce({ id: 1, userTypeId: EUserTypes.SUPER_ADMIN }) // User type exists (Super Admin)
                        .mockResolvedValueOnce({ id: 2, userTypeId: EUserTypes.MANAGER }) // User type exists (Manager)
                        .mockResolvedValueOnce({ id: 3, userTypeId: EUserTypes.EMPLOYEE }) // User type exists (Employee)
                        .mockResolvedValueOnce(null) // User doesn't exist
                        .mockResolvedValueOnce({ id: 1, userTypeId: EUserTypes.SUPER_ADMIN }), // User type lookup
                    create: jest.fn().mockImplementation((entity, data) => ({ ...data, id: 1 })),
                    save: jest.fn().mockImplementation((entity) => Promise.resolve(entity)),
                },
            };

            dataSource.createQueryRunner.mockReturnValue(mockQueryRunner as any);

            const result = await service.seedDatabase();

            expect(result).toBe(true);
            expect(mockQueryRunner.manager.findOne).toHaveBeenCalled();
            expect(mockQueryRunner.manager.create).toHaveBeenCalled();
            expect(mockQueryRunner.manager.save).toHaveBeenCalled();
        });

        it('should handle transaction rollback on error', async () => {
            const mockQueryRunner = {
                connect: jest.fn(),
                startTransaction: jest.fn(),
                rollbackTransaction: jest.fn(),
                release: jest.fn(),
                manager: {
                    findOne: jest
                        .fn()
                        .mockResolvedValueOnce(null) // First call for user type check (Super Admin)
                        .mockRejectedValueOnce(new Error('Creation failed')), // Second call fails
                    create: jest.fn().mockImplementation((entity, data) => ({ ...data, id: 1 })),
                    save: jest.fn().mockImplementation((entity) => Promise.resolve(entity)),
                },
            };

            dataSource.createQueryRunner.mockReturnValue(mockQueryRunner as any);

            await expect(service.seedDatabase()).rejects.toThrow('Database seeding failed');
            expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
            expect(mockQueryRunner.release).toHaveBeenCalled();
        });

        it('should log successful seeding', async () => {
            const mockQueryRunner = {
                connect: jest.fn(),
                startTransaction: jest.fn(),
                commitTransaction: jest.fn(),
                rollbackTransaction: jest.fn(),
                release: jest.fn(),
                manager: {
                    findOne: jest
                        .fn()
                        .mockResolvedValueOnce(null) // First call for user type check (Super Admin)
                        .mockResolvedValueOnce(null) // Second call for user type check (Manager)
                        .mockResolvedValueOnce(null) // Third call for user type check (Employee)
                        .mockResolvedValueOnce(null) // Fourth call for user check
                        .mockResolvedValueOnce({ id: 1, userTypeId: EUserTypes.SUPER_ADMIN }), // Fifth call for user type lookup
                    create: jest.fn().mockImplementation((entity, data) => ({ ...data, id: 1 })),
                    save: jest.fn().mockImplementation((entity) => Promise.resolve(entity)),
                },
            };

            dataSource.createQueryRunner.mockReturnValue(mockQueryRunner as any);

            const result = await service.seedDatabase();

            expect(result).toBe(true);
            expect(logger.info).toHaveBeenCalledWith('Starting database seeding transaction');
            expect(logger.info).toHaveBeenCalledWith('Seeding transaction committed');
            expect(logger.info).toHaveBeenCalledWith('Query runner released');
        });

        it('should log errors during seeding', async () => {
            const mockQueryRunner = {
                connect: jest.fn(),
                startTransaction: jest.fn(),
                rollbackTransaction: jest.fn(),
                release: jest.fn(),
                manager: {
                    findOne: jest.fn().mockRejectedValue(new Error('Database connection failed')),
                },
            };

            dataSource.createQueryRunner.mockReturnValue(mockQueryRunner as any);

            try {
                await service.seedDatabase();
            } catch (error) {
                // Expected to throw
            }

            expect(logger.error).toHaveBeenCalledWith('Seeding transaction failed', expect.any(Error));
            expect(logger.warn).toHaveBeenCalledWith('Seeding transaction rolled back');
        });
    });
});
