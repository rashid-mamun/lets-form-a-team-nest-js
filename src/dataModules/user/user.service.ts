import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UserEntity } from "./entities/user.entity";
import { DeleteResult, Repository } from "typeorm";
import { UserProfileEntity } from "./entities/userProfile.entity";
import { IPaginatedResult, ISearchOptions } from "src/common/interfaces/common.interface";



@Injectable()
export class UserEntityService {
    constructor(
        @InjectRepository(UserEntity)
        private readonly userRepo: Repository<UserEntity>,

        @InjectRepository(UserProfileEntity)
        private readonly userProfileRepo: Repository<UserProfileEntity>,
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

    /* async getUserProfile(searchOptions: ISearchOptions): Promise<any | null> {
        const { filters } = searchOptions;

        return await this.userRepo.findOne({
            relations: {
                profile: true,
            },
            where: filters,
        });
    } */

    async insertUserProfile(userProfile: Partial<UserProfileEntity>): Promise<UserProfileEntity> {
        return await this.userProfileRepo.save(userProfile);
    }
    
}