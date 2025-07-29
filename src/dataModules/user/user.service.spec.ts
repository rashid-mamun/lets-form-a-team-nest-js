import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntityService } from './user.service';
import { UserEntity } from './entities/user.entity';
import { UserProfileEntity } from './entities/userProfile.entity';
import { UserTypeEntity } from './entities/userType.entity';
import { UserTypeMapEntity } from './entities/userTypeMap.entity';
import { EUserTypes } from '../../common/constants/common.enum';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('UserEntityService', () => {
    let service: UserEntityService;
    let userRepository: jest.Mocked<Repository<UserEntity>>;
    let userProfileRepository: jest.Mocked<Repository<UserProfileEntity>>;
    let userTypeRepository: jest.Mocked<Repository<UserTypeEntity>>;
    let userTypeMapRepository: jest.Mocked<Repository<UserTypeMapEntity>>;

    const mockUser = {
        id: 1,
        username: 'testuser',
        password: 'hashedPassword',
        createdAt: new Date(),
        updatedAt: new Date(),
        profile: {
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
        },
    };

    const mockUsers = [
        {
            id: 1,
            username: 'user1',
            password: 'hashedPassword',
            createdAt: new Date(),
            updatedAt: new Date(),
            profile: mockUser.profile,
        },
        {
            id: 2,
            username: 'user2',
            password: 'hashedPassword',
            createdAt: new Date(),
            updatedAt: new Date(),
            profile: mockUser.profile,
        },
    ];

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

    const mockUserType = {
        id: 1,
        userTypeId: EUserTypes.SUPER_ADMIN,
        userType: 'SUPER_ADMIN',
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    const mockUserTypeMap = {
        id: 1,
        userTypeId: EUserTypes.SUPER_ADMIN,
        userId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    beforeEach(async () => {
        const mockUserRepo = {
            findOne: jest.fn(),
            find: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
        };

        const mockUserProfileRepo = {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
        };

        const mockUserTypeRepo = {
            findOne: jest.fn(),
        };

        const mockUserTypeMapRepo = {
            create: jest.fn(),
            save: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UserEntityService,
                {
                    provide: getRepositoryToken(UserEntity),
                    useValue: mockUserRepo,
                },
                {
                    provide: getRepositoryToken(UserProfileEntity),
                    useValue: mockUserProfileRepo,
                },
                {
                    provide: getRepositoryToken(UserTypeEntity),
                    useValue: mockUserTypeRepo,
                },
                {
                    provide: getRepositoryToken(UserTypeMapEntity),
                    useValue: mockUserTypeMapRepo,
                },
            ],
        }).compile();

        service = module.get<UserEntityService>(UserEntityService);
        userRepository = module.get(getRepositoryToken(UserEntity));
        userProfileRepository = module.get(getRepositoryToken(UserProfileEntity));
        userTypeRepository = module.get(getRepositoryToken(UserTypeEntity));
        userTypeMapRepository = module.get(getRepositoryToken(UserTypeMapEntity));
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('getUser', () => {
        it('should return user when found', async () => {
            userRepository.findOne.mockResolvedValue(mockUser as any);

            const result = await service.getUser({ filters: { id: 1 } });

            expect(result).toEqual(mockUser);
            expect(userRepository.findOne).toHaveBeenCalled();
        });

        it('should return null when user not found', async () => {
            userRepository.findOne.mockResolvedValue(null);

            const result = await service.getUser({ filters: { id: 999 } });

            expect(result).toBeNull();
        });
    });

    describe('getUsers', () => {
        it('should return all users', async () => {
            userRepository.find.mockResolvedValue(mockUsers as any);

            const result = await service.getUsers({});

            expect(result).toEqual({ items: mockUsers });
            expect(userRepository.find).toHaveBeenCalled();
        });

        it('should return empty array when no users found', async () => {
            userRepository.find.mockResolvedValue([]);

            const result = await service.getUsers({});

            expect(result).toEqual({ items: [] });
        });
    });

    describe('getUserType', () => {
        it('should return user type when found', async () => {
            userTypeRepository.findOne.mockResolvedValue(mockUserType as UserTypeEntity);

            const result = await service.getUserType({ filters: { userTypeId: EUserTypes.SUPER_ADMIN } });

            expect(result).toEqual(mockUserType);
            expect(userTypeRepository.findOne).toHaveBeenCalled();
        });

        it('should return null when user type not found', async () => {
            userTypeRepository.findOne.mockResolvedValue(null);

            const result = await service.getUserType({ filters: { userTypeId: EUserTypes.MANAGER } });

            expect(result).toBeNull();
        });
    });

    describe('getUserProfile', () => {
        it('should return user profile when found', async () => {
            userProfileRepository.findOne.mockResolvedValue(mockUserProfile as any);

            const result = await service.getUserProfile({ filters: { userId: 1 } });

            expect(result).toEqual(mockUserProfile);
            expect(userProfileRepository.findOne).toHaveBeenCalled();
        });

        it('should return null when user profile not found', async () => {
            userProfileRepository.findOne.mockResolvedValue(null);

            const result = await service.getUserProfile({ filters: { userId: 999 } });

            expect(result).toBeNull();
        });
    });

    describe('insertUser', () => {
        it('should insert user successfully', async () => {
            const userData = {
                username: 'newuser',
                password: 'password123',
            };

            const createdUser = {
                password: 'hashedPassword',
                id: 1,
                username: 'newuser',
                createdAt: new Date(),
                updatedAt: new Date(),
                profile: mockUser.profile,
            };

            const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;
            mockedBcrypt.hash.mockResolvedValue('hashedPassword' as never);

            userRepository.create.mockReturnValue(createdUser as any);
            userRepository.save.mockResolvedValue(createdUser as any);

            const result = await service.insertUser(userData);

            expect(result).toEqual(createdUser);
            expect(userRepository.create).toHaveBeenCalledWith({ ...userData, password: 'hashedPassword' });
            expect(userRepository.save).toHaveBeenCalledWith(createdUser);
        });

        it('should handle bcrypt hashing errors', async () => {
            const userData = {
                username: 'newuser',
                password: 'password123',
            };

            const error = new Error('Bcrypt error');
            const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;
            mockedBcrypt.hash.mockRejectedValue(error as never);

            await expect(service.insertUser(userData)).rejects.toThrow('Bcrypt error');
        });
    });

    describe('insertUserProfile', () => {
        it('should insert user profile successfully', async () => {
            const profileData = {
                name: 'Test User',
                email: 'test@example.com',
                contactNumber: '1234567890',
                userId: 1,
                createdBy: 1,
                updatedBy: 1,
            };

            userProfileRepository.create.mockReturnValue(mockUserProfile as any);
            userProfileRepository.save.mockResolvedValue(mockUserProfile as any);

            const result = await service.insertUserProfile(profileData);

            expect(result).toEqual(mockUserProfile);
            expect(userProfileRepository.create).toHaveBeenCalledWith(profileData);
            expect(userProfileRepository.save).toHaveBeenCalledWith(mockUserProfile);
        });

        it('should handle profile creation errors', async () => {
            const profileData = {
                name: 'Test User',
                email: 'test@example.com',
                contactNumber: '1234567890',
                userId: 1,
                createdBy: 1,
                updatedBy: 1,
            };

            userProfileRepository.create.mockReturnValue(mockUserProfile as any);
            userProfileRepository.save.mockRejectedValue(new Error('Database error'));

            await expect(service.insertUserProfile(profileData)).rejects.toThrow('Database error');
        });
    });

    describe('insertUserTypeMap', () => {
        it('should insert user type map successfully', async () => {
            const mapData = {
                userTypeId: EUserTypes.SUPER_ADMIN,
                userId: 1,
            };

            userTypeMapRepository.create.mockReturnValue(mockUserTypeMap as UserTypeMapEntity);
            userTypeMapRepository.save.mockResolvedValue(mockUserTypeMap as UserTypeMapEntity);

            const result = await service.insertUserTypeMap(mapData);

            expect(result).toEqual(mockUserTypeMap);
            expect(userTypeMapRepository.create).toHaveBeenCalledWith(mapData);
            expect(userTypeMapRepository.save).toHaveBeenCalledWith(mockUserTypeMap);
        });
    });

    describe('validateUser', () => {
        it('should validate user successfully', async () => {
            const username = 'testuser';
            const password = 'password123';
            const hashedPassword = 'hashedPassword';

            userRepository.findOne.mockResolvedValue({ ...mockUser, password: hashedPassword } as any);
            const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;
            mockedBcrypt.compare.mockResolvedValue(true as never);

            const result = await service.validateUser(username, password);

            expect(result).toEqual({ ...mockUser, password: hashedPassword });
            expect(userRepository.findOne).toHaveBeenCalledWith({ where: { username } });
            expect(mockedBcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
        });

        it('should return null when user not found', async () => {
            const username = 'nonexistent';
            const password = 'password123';

            userRepository.findOne.mockResolvedValue(null);

            const result = await service.validateUser(username, password);

            expect(result).toBeNull();
            expect(userRepository.findOne).toHaveBeenCalledWith({ where: { username } });
        });

        it('should return null when password is invalid', async () => {
            const username = 'testuser';
            const password = 'wrongpassword';
            const hashedPassword = 'hashedPassword';

            userRepository.findOne.mockResolvedValue({ ...mockUser, password: hashedPassword } as any);
            const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;
            mockedBcrypt.compare.mockResolvedValue(false as never);

            const result = await service.validateUser(username, password);

            expect(result).toBeNull();
            expect(mockedBcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
        });

        it('should handle bcrypt comparison errors', async () => {
            const username = 'testuser';
            const password = 'password123';
            const hashedPassword = 'hashedPassword';

            userRepository.findOne.mockResolvedValue({ ...mockUser, password: hashedPassword } as any);
            const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;
            mockedBcrypt.compare.mockRejectedValue(new Error('Bcrypt error') as never);

            await expect(service.validateUser(username, password)).rejects.toThrow('Bcrypt error');
        });
    });
});
