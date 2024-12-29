import { Injectable } from '@nestjs/common';
import { EUserTypes } from 'src/common/constants/common.enum';
import { UserEntity } from 'src/dataModules/user/entities/user.entity';
import { UserProfileEntity } from 'src/dataModules/user/entities/userProfile.entity';
import { UserTypeEntity } from 'src/dataModules/user/entities/userType.entity';
import { UserTypeMapEntity } from 'src/dataModules/user/entities/userTypeMap.entity';
import { UserEntityService } from 'src/dataModules/user/user.service';
import { CentralLogger } from 'src/shared/loggerServices/centralLogger.service';
import { DataSource, QueryRunner } from 'typeorm';

@Injectable()
export class SeederService {
    constructor(
        private readonly dataSource: DataSource,
        private readonly userService: UserEntityService,
        private readonly logger: CentralLogger,
    ) { }

    async seedDatabase(): Promise<Boolean> {
        let isSuccess = false;
        const queryRunner = this.dataSource.createQueryRunner();

        try {
            await queryRunner.connect();
            await queryRunner.startTransaction();
            this.logger.info('Transaction started');

            await this.createAccountTypes(queryRunner);
            this.logger.info('Account types created');

            await this.createSuperAdminUser(queryRunner);
            this.logger.info('Super admin user created');

            await queryRunner.commitTransaction();
            this.logger.info('Transaction committed');

            isSuccess = true;
        } catch (error) {
            this.logger.warn('transaction error', error);
            await queryRunner.rollbackTransaction();
            this.logger.warn('Transaction rolled back');
            isSuccess = false;
        } finally {
            await queryRunner.release();
        }
        return isSuccess;
    }

    private async createAccountTypes(queryRunner: QueryRunner): Promise<void> {
        const accountTypes = [
            { userType: 'Super Admin', userTypeId: EUserTypes.SUPER_ADMIN },
            { userType: 'Manager', userTypeId: EUserTypes.MANAGER },
            { userType: 'Employee', userTypeId: EUserTypes.EMPLOYEE },
        ];

        for (const accountType of accountTypes) {
            const existingType = await this.userService.getUserType({
                filters: { userTypeId: accountType.userTypeId }
            });

            if (!existingType) {
                const result = await queryRunner.manager.createQueryBuilder()
                    .insert()
                    .into(UserTypeEntity)
                    .values(accountType)
                    .execute();
            }
        }
    }

    private async createSuperAdminUser(queryRunner: QueryRunner): Promise<void> {
        const superAdminInstance = await this.userService.getUser({
            filters: { username: 'superAdmin' }
        });
      
        if (!superAdminInstance) {
            const authUserInstance = await queryRunner.manager.createQueryBuilder()
                .insert()
                .into(UserEntity)
                .values({ username: 'superAdmin', password: 'super_admin1' })
                .execute();


            const userProfileInstance = await queryRunner.manager.createQueryBuilder()
                .insert()
                .into(UserProfileEntity)
                .values({
                    name: 'Super Admin',
                    contactNumber: '01837645524',
                    email: 'amr72335gmail.com',
                    authUserId: authUserInstance.identifiers[0].id.toString()
                })
                .execute();


            // Fetch the newly inserted super admin type within the transaction
            const superAdminAccountTypeInstance = await queryRunner.manager.findOne(UserTypeEntity, { where: { userTypeId: EUserTypes.SUPER_ADMIN } });

            if (superAdminAccountTypeInstance) {
                await queryRunner.manager.createQueryBuilder()
                    .insert()
                    .into(UserTypeMapEntity)
                    .values({ userTypeId: superAdminAccountTypeInstance.id, userId: userProfileInstance.identifiers[0].id })
                    .execute();

            }
        }
    }
}
