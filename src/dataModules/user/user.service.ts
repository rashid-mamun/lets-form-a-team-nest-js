import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UserEntity } from "./entities/user.entity";
import { DeleteResult, Repository } from "typeorm";
import { UserProfileEntity } from "./entities/userProfile.entity";
import { IPaginatedResult, ISearchOptions } from "src/common/interfaces/common.interface";
import * as bcrypt from 'bcrypt';
import { UserTypeEntity } from "./entities/userType.entity";
import { UserTypeMapEntity } from "./entities/userTypeMap.entity";



@Injectable()
export class UserEntityService {
    constructor(
        @InjectRepository(UserEntity)
        private readonly userRepo: Repository<UserEntity>,

        @InjectRepository(UserProfileEntity)
        private readonly userProfileRepo: Repository<UserProfileEntity>,

        @InjectRepository(UserTypeEntity)
        private readonly userTypeRepo: Repository<UserTypeEntity>,

        @InjectRepository(UserTypeMapEntity)
        private readonly userTypeMapRepo: Repository<UserTypeMapEntity>,
    ) { }
    async getUser(searchOptions: any): Promise<UserEntity | null> {
        const { filters } = searchOptions;
        return await this.userRepo.findOne({
            where: filters,
        });
    }
    async insertUser(user: any): Promise<UserEntity> {
        return await this.userRepo.save(user);
    }
    async insertUsers(users: UserEntity[]): Promise<UserEntity[]> {
        return await this.userRepo.save(users);
    }
    async getUsers(searchOptions: ISearchOptions): Promise<IPaginatedResult<UserEntity>> {
        const { filters, pageSize, page } = searchOptions;
        const skip = pageSize && page ? pageSize * (page - 1) : 0;
        const totalRecords = await this.userRepo.count(filters);
        const result = await this.userRepo.find({
            where: filters,
            skip,
            take: pageSize,
        });
        return {
            items: result,
            pagination: {
                currentPage: page,
                pageSize,
                totalRecords: totalRecords,
            },
        } as IPaginatedResult<UserEntity>;
    }
    async updateUser(searchOptions: ISearchOptions, updatedData: Partial<UserEntity>): Promise<Partial<UserEntity>> {
        const { filters } = searchOptions;
        if (!filters) {
            throw new NotFoundException('Invalid search options');
        }
        const updateResult = await this.userRepo.update(filters, updatedData);
        if (updateResult.affected) {
            return updatedData;
        }
        throw new NotFoundException('No matching record found for update');
    }
    async deleteUser(searchOptions: ISearchOptions): Promise<DeleteResult> {
        const { filters } = searchOptions;
        if (!filters) {
            throw new NotFoundException('Invalid search options');
        }
        const deleteResult = await this.userRepo.delete(filters);
        if (deleteResult.affected) {
            return deleteResult;
        }
        throw new NotFoundException('No matching record found for deletion');
    }
    async validateUser(username: string, pass: string): Promise<any> {
        const user = await this.userRepo.findOne({ where: { username } });
        if (user && await bcrypt.compare(pass, user.password)) {
            const { password, ...result } = user;
            return result;
        }
        return null;

    }


    // Methods for UserProfileEntity...
    async insertUserProfile(userProfile: Partial<UserProfileEntity>): Promise<UserProfileEntity> {
        return await this.userProfileRepo.save(userProfile);
    }
    async insertUserProfiles(userProfiles: Partial<UserProfileEntity>[]): Promise<UserProfileEntity[]> {
        return await this.userProfileRepo.save(userProfiles);
    }
    async getUserProfile(searchOptions: ISearchOptions): Promise<UserProfileEntity | null> {
        const { filters } = searchOptions;
        return await this.userProfileRepo.findOne({ where: filters });
    }


    // Methods for UserTypeEntity.
    async getUserType(searchOptions: ISearchOptions): Promise<UserTypeEntity | null> {
        const { filters } = searchOptions;
        return await this.userTypeRepo.findOne({ where: filters });
    }
    async insertUserType(userType: UserTypeEntity): Promise<UserTypeEntity> {
        return await this.userTypeRepo.save(userType);
    }

    async insertUserTypes(userTypes: UserTypeEntity[]): Promise<UserTypeEntity[]> {
        return await this.userTypeRepo.save(userTypes);
    }

    // Methods for UserTypeMapEntity...
    async getUserTypeMap(searchOptions: ISearchOptions): Promise<UserTypeMapEntity | null> {
        const { filters } = searchOptions;
        return await this.userTypeMapRepo.findOne({ where: filters });
    }

    async insertUserTypeMap(userTypeMap: Partial<UserTypeMapEntity>): Promise<UserTypeMapEntity | null> {
        return await this.userTypeMapRepo.save(userTypeMap);
    }

    async insertUserTypeMaps(userTypeMaps: UserTypeMapEntity[]): Promise<UserTypeMapEntity[]> {
        return await this.userTypeMapRepo.save(userTypeMaps);
    }

}