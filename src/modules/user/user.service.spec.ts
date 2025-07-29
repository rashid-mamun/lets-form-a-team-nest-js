import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { UserEntityService } from '../../dataModules/user/user.service';
import { CentralLogger } from '../../shared/loggerServices/centralLogger.service';
import { DataSource } from 'typeorm';
import { CreateUserDto } from '../../common/dtos/create-user.dto';
import { EUserTypes } from '../../common/constants/common.enum';
import { NotFoundException } from '@nestjs/common';

describe('UserService', () => {
    let service: UserService;
    let userEntityService: jest.Mocked<UserEntityService>;
    let dataSource: jest.Mocked<DataSource>;
    let _logger: jest.Mocked<CentralLogger>;

    const mockUserType = {
        id: 1,
        userTypeId: EUserTypes.SUPER_ADMIN,
        userType: 'SUPER_ADMIN',
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    const mockAuthUser = {
        id: 1,
        username: 'testuser',
        password: 'hashedPassword',
        createdAt: new Date(),
        updatedAt: new Date(),
        profile: null, // Will be set after profile creation
    };

    const mockProfile = {
        id: 1,
        userId: 1,
        name: 'Test User',
        email: 'test@example.com',
        contactNumber: '1234567890',
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 1,
        updatedBy: 1,
        user: null, // Circular reference
    };

    const mockUserTypeMap = {
        id: 1,
        userTypeId: EUserTypes.SUPER_ADMIN,
        userId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    const mockUser = {
        id: 1,
        username: 'testuser',
        createdAt: new Date(),
        updatedAt: new Date(),
        password: 'hashedPassword',
        profile: mockProfile,
    };

    const mockUserProfile = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        contactNumber: '1234567890',
        userId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 1,
        updatedBy: 1,
        user: null,
    };

    const _mockUsers = [
        {
            id: 1,
            username: 'user1',
            createdAt: new Date(),
            updatedAt: new Date(),
            password: 'hashedPassword',
            profile: mockProfile,
        },
        {
            id: 2,
            username: 'user2',
            createdAt: new Date(),
            updatedAt: new Date(),
            password: 'hashedPassword',
            profile: mockProfile,
        },
    ];

    const mockUserWithPassword = {
        password: 'hashedPassword',
        id: 1,
        username: 'testuser',
        createdAt: new Date(),
        updatedAt: new Date(),
        profile: mockProfile,
    };

    beforeEach(async () => {
        const mockUserEntityService = {
            getUserType: jest.fn(),
            insertUser: jest.fn(),
            insertUserProfile: jest.fn(),
            insertUserTypeMap: jest.fn(),
            getUser: jest.fn(),
            getUserProfile: jest.fn(),
            getUsers: jest.fn(),
            validateUser: jest.fn(),
            getUserTypeMap: jest.fn(),
        };

        const mockDataSource = {
            createQueryRunner: jest.fn(),
        };

        const mockLogger = {
            info: jest.fn(),
            error: jest.fn(),
            warn: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UserService,
                {
                    provide: UserEntityService,
                    useValue: mockUserEntityService,
                },
                {
                    provide: DataSource,
                    useValue: mockDataSource,
                },
                {
                    provide: CentralLogger,
                    useValue: mockLogger,
                },
            ],
        }).compile();

        service = module.get<UserService>(UserService);
        userEntityService = module.get(UserEntityService);
        dataSource = module.get(DataSource);
        const _logger = module.get(CentralLogger);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('registerUser', () => {
        const createUserDto: CreateUserDto = {
            username: 'testuser',
            password: 'password123',
            name: 'Test User',
            email: 'test@example.com',
            contactNumber: '1234567890',
            userTypeId: EUserTypes.SUPER_ADMIN,
            userId: 1,
        };

        it('should register a user successfully', async () => {
            const mockQueryRunner = {
                connect: jest.fn(),
                startTransaction: jest.fn(),
                commitTransaction: jest.fn(),
                rollbackTransaction: jest.fn(),
                release: jest.fn(),
                manager: {
                    findOne: jest.fn().mockResolvedValue(null),
                },
            };

            dataSource.createQueryRunner.mockReturnValue(mockQueryRunner as any);
            userEntityService.getUserType.mockResolvedValue(mockUserType);
            userEntityService.insertUser.mockResolvedValue(mockAuthUser as any);
            userEntityService.insertUserProfile.mockResolvedValue(mockProfile as any);
            userEntityService.insertUserTypeMap.mockResolvedValue(mockUserTypeMap);

            const result = await service.registerUser(createUserDto);

            expect(result).toBeDefined();
            expect(result.id).toBe(1);
            expect(result.username).toBe('testuser');
            expect(mockQueryRunner.startTransaction).toHaveBeenCalled();
            expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
            expect(mockQueryRunner.release).toHaveBeenCalled();
        });

        it('should register a user with requesting user ID', async () => {
            const mockQueryRunner = {
                connect: jest.fn(),
                startTransaction: jest.fn(),
                commitTransaction: jest.fn(),
                rollbackTransaction: jest.fn(),
                release: jest.fn(),
                manager: {
                    findOne: jest.fn().mockResolvedValue(null),
                },
            };

            dataSource.createQueryRunner.mockReturnValue(mockQueryRunner as any);
            userEntityService.getUserType.mockResolvedValue(mockUserType);
            userEntityService.getUser
                .mockResolvedValueOnce(null) // Username doesn't exist
                .mockResolvedValueOnce(mockUser as any); // Requesting user exists
            userEntityService.getUserTypeMap.mockResolvedValueOnce({
                id: 1,
                userId: 2,
                userTypeId: EUserTypes.SUPER_ADMIN,
                createdAt: new Date(),
                updatedAt: new Date(),
            } as any); // Requesting user is super admin
            userEntityService.insertUser.mockResolvedValue(mockAuthUser as any);
            userEntityService.insertUserProfile.mockResolvedValue(mockProfile as any);
            userEntityService.insertUserTypeMap.mockResolvedValue(mockUserTypeMap);

            const result = await service.registerUser(createUserDto, 2);

            expect(result).toBeDefined();
            expect(result.id).toBe(1);
            expect(result.username).toBe('testuser');
        });

        it('should throw error when user type not found', async () => {
            const mockQueryRunner = {
                connect: jest.fn(),
                startTransaction: jest.fn(),
                rollbackTransaction: jest.fn(),
                release: jest.fn(),
                manager: {
                    findOne: jest.fn().mockResolvedValue(null),
                },
            };

            dataSource.createQueryRunner.mockReturnValue(mockQueryRunner as any);
            userEntityService.getUserType.mockResolvedValue(null);

            await expect(service.registerUser(createUserDto)).rejects.toThrow('Invalid user type');
            expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
            expect(mockQueryRunner.release).toHaveBeenCalled();
        });

        it('should throw error when user already exists', async () => {
            const mockQueryRunner = {
                connect: jest.fn(),
                startTransaction: jest.fn(),
                rollbackTransaction: jest.fn(),
                release: jest.fn(),
                manager: {
                    findOne: jest.fn().mockResolvedValue(mockUser),
                },
            };

            dataSource.createQueryRunner.mockReturnValue(mockQueryRunner as any);
            userEntityService.getUserType.mockResolvedValue(mockUserType);

            await expect(service.registerUser(createUserDto)).rejects.toThrow('email already exist.');
            expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
            expect(mockQueryRunner.release).toHaveBeenCalled();
        });

        it('should throw error when profile already exists', async () => {
            const mockQueryRunner = {
                connect: jest.fn(),
                startTransaction: jest.fn(),
                commitTransaction: jest.fn(),
                rollbackTransaction: jest.fn(),
                release: jest.fn(),
                manager: {
                    findOne: jest.fn().mockResolvedValue(null),
                },
            };

            dataSource.createQueryRunner.mockReturnValue(mockQueryRunner as any);
            userEntityService.getUserType.mockResolvedValue(mockUserType);
            userEntityService.insertUser.mockResolvedValue(mockAuthUser as any);
            userEntityService.insertUserProfile.mockResolvedValue(mockProfile as any);
            userEntityService.getUserProfile.mockResolvedValue(mockUserProfile as any);

           
            const result = await service.registerUser(createUserDto);
            expect(result).toBeDefined();
            expect(result.id).toBe(1);
            expect(result.username).toBe('testuser');
        });

        it('should throw ForbiddenException when unauthorized to create manager', async () => {
            const managerDto = { ...createUserDto, userTypeId: EUserTypes.MANAGER };
            const mockQueryRunner = {
                connect: jest.fn(),
                startTransaction: jest.fn(),
                rollbackTransaction: jest.fn(),
                release: jest.fn(),
                manager: {
                    findOne: jest.fn().mockResolvedValue(null),
                },
            };

            dataSource.createQueryRunner.mockReturnValue(mockQueryRunner as any);
            userEntityService.getUserType.mockResolvedValue({ ...mockUserType, userTypeId: EUserTypes.EMPLOYEE });
            userEntityService.getUser
                .mockResolvedValueOnce(null) // Username doesn't exist
                .mockResolvedValueOnce(mockUser as any); // Requesting user exists
            userEntityService.getUserTypeMap.mockResolvedValueOnce({
                id: 1,
                userId: 3,
                userTypeId: EUserTypes.EMPLOYEE,
                createdAt: new Date(),
                updatedAt: new Date(),
            } as any); // Requesting user is employee

            await expect(service.registerUser(managerDto, 3)).rejects.toThrow('Only super admins can create managers');
            expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
            expect(mockQueryRunner.release).toHaveBeenCalled();
        });

        it('should throw ForbiddenException when unauthorized to create employee', async () => {
            const employeeDto = { ...createUserDto, userTypeId: EUserTypes.EMPLOYEE };
            const mockQueryRunner = {
                connect: jest.fn(),
                startTransaction: jest.fn(),
                rollbackTransaction: jest.fn(),
                release: jest.fn(),
                manager: {
                    findOne: jest.fn().mockResolvedValue(null),
                },
            };

            dataSource.createQueryRunner.mockReturnValue(mockQueryRunner as any);
            userEntityService.getUserType.mockResolvedValue(mockUserType);
            userEntityService.getUser
                .mockResolvedValueOnce(null) // Username doesn't exist
                .mockResolvedValueOnce(mockUser as any); // Requesting user exists
            userEntityService.getUserTypeMap.mockResolvedValueOnce({
                id: 1,
                userId: 3,
                userTypeId: EUserTypes.EMPLOYEE,
                createdAt: new Date(),
                updatedAt: new Date(),
            } as any); // Requesting user is employee

            await expect(service.registerUser(employeeDto, 3)).rejects.toThrow('Only super admins and managers can create employees');
            expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
            expect(mockQueryRunner.release).toHaveBeenCalled();
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

            await expect(service.registerUser(createUserDto)).rejects.toThrow('Invalid user type');
            expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
            expect(mockQueryRunner.release).toHaveBeenCalled();
        });
    });

    describe('getAllUsers', () => {
        it('should return all users', async () => {
            const mockUsersResponse = {
                items: [
                    {
                        id: 1,
                        username: 'user1',
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    },
                    {
                        id: 2,
                        username: 'user2',
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    },
                ],
            };

            userEntityService.getUsers.mockResolvedValue(mockUsersResponse as any);

            const result = await service.getAllUsers();

            expect(result).toEqual(mockUsersResponse.items);
            expect(userEntityService.getUsers).toHaveBeenCalled();
        });

        it('should handle empty users list', async () => {
            userEntityService.getUsers.mockResolvedValue({ items: [] });

            const result = await service.getAllUsers();

            expect(result).toEqual([]);
        });
    });

    describe('getUserById', () => {
        it('should return user by ID', async () => {
            userEntityService.getUser.mockResolvedValue(mockUser as any);

            const result = await service.getUserById(1);

            expect(result).toEqual({
                id: mockUser.id,
                username: mockUser.username,
                createdAt: mockUser.createdAt,
                updatedAt: mockUser.updatedAt,
            });
            expect(userEntityService.getUser).toHaveBeenCalledWith({ filters: { id: 1 } });
        });

        it('should throw NotFoundException when user not found', async () => {
            userEntityService.getUser.mockResolvedValue(null);

            await expect(service.getUserById(999)).rejects.toThrow(NotFoundException);
            expect(userEntityService.getUser).toHaveBeenCalledWith({ filters: { id: 999 } });
        });
    });

    describe('validateUser', () => {
        it('should validate user successfully', async () => {
            userEntityService.validateUser.mockResolvedValue(mockUserWithPassword as any);
            userEntityService.getUserProfile.mockResolvedValue(mockUserProfile as any);

            const result = await service.validateUser('testuser', 'password123');

            expect(result).toEqual({
                id: mockUserWithPassword.id,
                username: mockUserWithPassword.username,
                profile: mockUserProfile,
            });
            expect(userEntityService.validateUser).toHaveBeenCalledWith('testuser', 'password123');
        });

        it('should return null when user not found', async () => {
            userEntityService.validateUser.mockResolvedValue(null);

            const result = await service.validateUser('invaliduser', 'password123');

            expect(result).toBeNull();
        });

        it('should return null when password is invalid', async () => {
            userEntityService.validateUser.mockResolvedValue(null);

            const result = await service.validateUser('testuser', 'wrongpassword');

            expect(result).toBeNull();
        });
    });
});
