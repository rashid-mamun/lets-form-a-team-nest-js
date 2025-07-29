import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { EUserTypes } from 'src/common/constants/common.enum';
import { UserEntityService } from 'src/dataModules/user/user.service';
import { CentralLogger } from 'src/shared/loggerServices/centralLogger.service';
import { DataSource } from 'typeorm';
import { CreateUserDto } from 'src/common/dtos/create-user.dto';
import { ApiResponseMessages } from 'src/common/constants/common.enum';
import { AlreadyExistException } from 'src/common/exceptions/alreadyExist.exception';
import { UserProfileEntity } from 'src/dataModules/user/entities/userProfile.entity';

/**
 * Service for managing user-related operations.
 */
@Injectable()
export class UserService {
    constructor(
        private readonly dataSource: DataSource,
        private readonly userEntityService: UserEntityService,
        private readonly logger: CentralLogger,
    ) {}

    async registerUser(createUserDto: CreateUserDto, requestingUserId?: number): Promise<any> {
        const queryRunner = this.dataSource.createQueryRunner();
        try {
            await queryRunner.connect();
            await queryRunner.startTransaction();
            this.logger.info('Transaction started for user registration');

            const accountTypeInstance = await this.userEntityService.getUserType({
                filters: { userTypeId: createUserDto.userTypeId },
            });
            if (!accountTypeInstance) {
                throw new Error(ApiResponseMessages.INVALID_USER_TYPE);
            }

            const authUserExists = await this.userEntityService.getUser({
                filters: { username: createUserDto.username },
            });
            if (authUserExists) {
                throw new AlreadyExistException('username', {
                    message: ApiResponseMessages.USERNAME_ALREADY_EXISTS(createUserDto.username),
                });
            }

            const emailExists = await queryRunner.manager.findOne(UserProfileEntity, {
                where: { email: createUserDto.email },
            });
            if (emailExists) {
                throw new AlreadyExistException('email', {
                    message: ApiResponseMessages.EMAIL_ALREADY_EXISTS(createUserDto.email),
                });
            }

            // Authorization check - only super admins can create managers, super admins and managers can create employees
            if (requestingUserId) {
                const requestingUser = await this.userEntityService.getUser({ filters: { id: requestingUserId } });
                if (!requestingUser) {
                    throw new ForbiddenException('Requesting user not found');
                }

                // Get requesting user's role through user type map
                const requestingUserTypeMap = await this.userEntityService.getUserTypeMap({
                    filters: { userId: requestingUserId },
                });
                if (!requestingUserTypeMap) {
                    throw new ForbiddenException('Requesting user role not found');
                }

                // Check permissions based on user type being created
                if (createUserDto.userTypeId === EUserTypes.MANAGER && requestingUserTypeMap.userTypeId !== EUserTypes.SUPER_ADMIN) {
                    throw new ForbiddenException('Only super admins can create managers');
                }

                if (createUserDto.userTypeId === EUserTypes.EMPLOYEE && ![EUserTypes.SUPER_ADMIN, EUserTypes.MANAGER].includes(requestingUserTypeMap.userTypeId)) {
                    throw new ForbiddenException('Only super admins and managers can create employees');
                }
            }

            const authUserInstance = await this.userEntityService.insertUser({
                username: createUserDto.username,
                password: createUserDto.password,
            });

            const userProfileInstance = await this.userEntityService.insertUserProfile({
                name: createUserDto.name,
                contactNumber: createUserDto.contactNumber,
                email: createUserDto.email,
                userId: authUserInstance.id,
                createdBy: requestingUserId || authUserInstance.id,
                updatedBy: requestingUserId || authUserInstance.id,
            });

            await this.userEntityService.insertUserTypeMap({
                userTypeId: accountTypeInstance.id,
                userId: authUserInstance.id,
            });

            await queryRunner.commitTransaction();
            this.logger.info('Transaction committed for user registration');

            return {
                id: authUserInstance.id,
                username: authUserInstance.username,
                name: userProfileInstance.name,
                contactNumber: userProfileInstance.contactNumber,
                email: userProfileInstance.email,
                userTypeId: accountTypeInstance.userTypeId,
            };
        } catch (error) {
            this.logger.warn('Transaction error during user registration', error);
            await queryRunner.rollbackTransaction();
            this.logger.warn('Transaction rolled back');
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    async getAllUsers(): Promise<any[]> {
        const users = await this.userEntityService.getUsers({});
        return users.items.map((user) => ({
            id: user.id,
            username: user.username,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        }));
    }

    async getUserById(id: number): Promise<any> {
        const user = await this.userEntityService.getUser({ filters: { id } });
        if (!user) {
            throw new NotFoundException(ApiResponseMessages.USER_NOT_FOUND);
        }
        return {
            id: user.id,
            username: user.username,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };
    }

    async validateUser(username: string, password: string): Promise<any> {
        const user = await this.userEntityService.validateUser(username, password);
        if (!user) {
            return null;
        }
        const profile = await this.userEntityService.getUserProfile({ filters: { userId: user.id } });
        return {
            id: user.id,
            username: user.username,
            profile,
        };
    }
}
