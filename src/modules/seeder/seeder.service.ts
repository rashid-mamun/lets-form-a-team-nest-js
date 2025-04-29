import { Injectable } from '@nestjs/common';
import { EUserTypes } from 'src/common/constants/common.enum';
import { UserEntity } from 'src/dataModules/user/entities/user.entity';
import { UserProfileEntity } from 'src/dataModules/user/entities/userProfile.entity';
import { UserTypeEntity } from 'src/dataModules/user/entities/userType.entity';
import { UserTypeMapEntity } from 'src/dataModules/user/entities/userTypeMap.entity';
import { UserEntityService } from 'src/dataModules/user/user.service';
import { CentralLogger } from 'src/shared/loggerServices/centralLogger.service';
import { DataSource, QueryRunner } from 'typeorm';
import { APP_CONFIG } from 'src/common/configs/app.config';
import * as bcrypt from 'bcrypt';
import { ApiResponseMessages } from 'src/common/constants/common.enum';

/**
 * Service for seeding the database with initial data.
 */
@Injectable()
export class SeederService {
    constructor(
        private readonly dataSource: DataSource,
        private readonly userService: UserEntityService,
        private readonly logger: CentralLogger,
    ) {}

    async seedDatabase(): Promise<boolean> {
        const queryRunner = this.dataSource.createQueryRunner();
        try {
            await queryRunner.connect();
            await queryRunner.startTransaction();
            this.logger.info('Starting database seeding transaction');

            await this.createAccountTypes(queryRunner);
            this.logger.info('Account types created');

            await this.createSuperAdminUser(queryRunner);
            this.logger.info('Super admin user created');

            await queryRunner.commitTransaction();
            this.logger.info('Seeding transaction committed');
            return true;
        } catch (error) {
            this.logger.error('Seeding transaction failed', error);
            await queryRunner.rollbackTransaction();
            this.logger.warn('Seeding transaction rolled back');
            throw new Error(ApiResponseMessages.SEEDING_FAILED);
        } finally {
            await queryRunner.release();
            this.logger.info('Query runner released');
        }
    }

    private async createAccountTypes(queryRunner: QueryRunner): Promise<void> {
        const userTypes = [
            { userType: 'Super Admin', userTypeId: EUserTypes.SUPER_ADMIN },
            { userType: 'Manager', userTypeId: EUserTypes.MANAGER },
            { userType: 'Employee', userTypeId: EUserTypes.EMPLOYEE },
        ];

        for (const type of userTypes) {
            const existingType = await queryRunner.manager.findOne(UserTypeEntity, {
                where: { userTypeId: type.userTypeId },
            });
            if (!existingType) {
                const userType = queryRunner.manager.create(UserTypeEntity, type);
                await queryRunner.manager.save(userType);
                this.logger.info(`Created user type: ${type.userType}`);
            } else {
                this.logger.info(`User type ${type.userType} already exists`);
            }
        }
    }

    private async createSuperAdminUser(queryRunner: QueryRunner): Promise<void> {
        const superAdminUsername = 'superAdmin';
        const superAdminEmail = 'superadmin@hrhero.com';

        const existingUser = await queryRunner.manager.findOne(UserEntity, {
            where: { username: superAdminUsername },
        });

        if (existingUser) {
            this.logger.info('Super Admin user already exists');
            return;
        }

        const hashedPassword = await bcrypt.hash(APP_CONFIG.SUPER_ADMIN_PASSWORD, 10);

        const user = queryRunner.manager.create(UserEntity, {
            username: superAdminUsername,
            password: hashedPassword,
        });
        const savedUser = await queryRunner.manager.save(user);
        this.logger.info('Super Admin user created');

        const profile = queryRunner.manager.create(UserProfileEntity, {
            name: 'Super Admin',
            email: superAdminEmail,
            contactNumber: '0000000000',
            userId: savedUser.id,
            createdBy: savedUser.id,
            updatedBy: savedUser.id,
        });
        const savedProfile = await queryRunner.manager.save(profile);
        this.logger.info('Super Admin profile created');

        const userType = await queryRunner.manager.findOne(UserTypeEntity, {
            where: { userTypeId: EUserTypes.SUPER_ADMIN },
        });
        if (!userType) {
            throw new Error('Super Admin user type not found');
        }

        const typeMap = queryRunner.manager.create(UserTypeMapEntity, {
            userId: savedProfile.id,
            userTypeId: userType.id,
        });
        await queryRunner.manager.save(typeMap);
        this.logger.info('Super Admin user type mapping created');
    }
}
