import { Injectable } from '@nestjs/common';
import { EUserTypes } from 'src/common/constants/common.enum';
import { UserEntityService } from 'src/dataModules/user/user.service';
import { CentralLogger } from 'src/shared/loggerServices/centralLogger.service';
import { DataSource } from 'typeorm';

@Injectable()
export class UserService {

    constructor(
        private readonly dataSource: DataSource,
        private readonly userEntitySrvc: UserEntityService,
        private readonly logger: CentralLogger,
    ) { }

    async registerUser(createUserDto: any): Promise<any> {
        const queryRunner = this.dataSource.createQueryRunner();
        try {
            await queryRunner.connect();
            await queryRunner.startTransaction();
            this.logger.info('Transaction started');

            const accountTypeInstance = await this.userEntitySrvc.getUserType({
                filters: { userTypeId: createUserDto.userTypeId }
            });
            if (!accountTypeInstance) {
                return { message: 'INVALID_ACCOUNT_TYPE' };
            }

            if (accountTypeInstance.userTypeId === EUserTypes.MANAGER) {
                if (createUserDto.accountType === EUserTypes.SUPER_ADMIN) {
                    let authUserExists = await this.userEntitySrvc.getUser({
                        filters: { username: createUserDto.username }
                    })
                    if (authUserExists) {
                        return {
                            message: 'USERNAME_ALREADY_EXISTS'
                        }
                    }
                    let authUserInstance = await this.userEntitySrvc.insertUser(
                        {
                            "username": createUserDto.username,
                            "password": createUserDto.password
                        }
                    )
                    let userProfileInstance = await this.userEntitySrvc.insertUserProfile(
                        {
                            "name": createUserDto.name,
                            "contactNumber": createUserDto.contactNumber,
                            "email": createUserDto.email,
                            "authUserId": authUserInstance.id.toString(),
                            "createdBy": createUserDto.userId,
                            "updatedBy": createUserDto.userId
                        }
                    )

                    let profileAccountTypeMapping = await this.userEntitySrvc.insertUserTypeMap(
                        {
                            "userTypeId": accountTypeInstance.id,
                            "userId": userProfileInstance.id
                        }
                    )


                }
            }
            else if (accountTypeInstance.userTypeId === EUserTypes.EMPLOYEE) {
                if (createUserDto.accountType === EUserTypes.SUPER_ADMIN || createUserDto.accountType === EUserTypes.MANAGER) {
                    let authUserExists = await this.userEntitySrvc.getUser({
                        where: { username: createUserDto.username }
                    })
                    if (authUserExists) {
                        return {
                            "message": ' ApiResponseMessages.USERNAME_ALREADY_EXISTS'
                        }
                    }
                    let authUserInstance = await this.userEntitySrvc.insertUser(
                        {
                            "username": createUserDto.username,
                            "password": createUserDto.password
                        }
                    )

                    let userProfileInstance = await this.userEntitySrvc.insertUserProfile(
                        {
                            "name": createUserDto.name,
                            "contactNumber": createUserDto.contactNumber,
                            "email": createUserDto.email,
                            "authUserId": authUserInstance.id.toString(),
                            "createdBy": createUserDto.userId,
                            "updatedBy": createUserDto.userId
                        }
                    )

                    let profileAccountTypeMapping = await this.userEntitySrvc.insertUserTypeMap(
                        {
                            "userTypeId": accountTypeInstance.id,
                            "userId": userProfileInstance.id
                        }
                    )

                }
            } else {
                return
                {
                    message: "ApiResponseMessages.NO_OTHER_USER_ALLOWED"
                }

            }




            await queryRunner.commitTransaction();
            this.logger.info('Transaction committed');


        } catch (error) {
            this.logger.warn('transaction error', error);
            await queryRunner.rollbackTransaction();
            this.logger.warn('Transaction rolled back');

        } finally {
            await queryRunner.release();
        }
        const user = await this.userEntitySrvc.insertUser(createUserDto);

    }
}
