import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity';
import { UserProfileEntity } from './entities/userProfile.entity';
import { UserTypeEntity } from './entities/userType.entity';
import { UserTypeMapEntity } from './entities/userTypeMap.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserEntityService {
    constructor(
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>,
        @InjectRepository(UserProfileEntity)
        private readonly userProfileRepository: Repository<UserProfileEntity>,
        @InjectRepository(UserTypeEntity)
        private readonly userTypeRepository: Repository<UserTypeEntity>,
        @InjectRepository(UserTypeMapEntity)
        private readonly userTypeMapRepository: Repository<UserTypeMapEntity>,
    ) {}

    async getUser(params: { filters: Partial<UserEntity> }): Promise<UserEntity | null> {
        return this.userRepository.findOne({ where: params.filters });
    }

    async getUsers(params: { filters?: Partial<UserEntity> }): Promise<{ items: UserEntity[] }> {
        const items = await this.userRepository.find({ where: params.filters });
        return { items };
    }

    async getUserType(params: { filters: Partial<UserTypeEntity> }): Promise<UserTypeEntity | null> {
        return this.userTypeRepository.findOne({ where: params.filters });
    }

    async getUserProfile(params: { filters: Partial<UserProfileEntity> }): Promise<UserProfileEntity | null> {
        return this.userProfileRepository.findOne({ where: params.filters });
    }

    async insertUser(params: { username: string; password: string }): Promise<UserEntity> {
        const hashedPassword = await bcrypt.hash(params.password, 10);
        const user = this.userRepository.create({ ...params, password: hashedPassword });
        return this.userRepository.save(user);
    }

    async insertUserProfile(params: { name: string; email: string; contactNumber: string; userId: number; createdBy: number; updatedBy: number }): Promise<UserProfileEntity> {
        const profile = this.userProfileRepository.create(params);
        return this.userProfileRepository.save(profile);
    }

    async insertUserTypeMap(params: { userId: number; userTypeId: number }): Promise<UserTypeMapEntity> {
        const map = this.userTypeMapRepository.create(params);
        return this.userTypeMapRepository.save(map);
    }

    async validateUser(username: string, password: string): Promise<UserEntity | null> {
        const user = await this.userRepository.findOne({ where: { username } });
        if (user && (await bcrypt.compare(password, user.password))) {
            return user;
        }
        return null;
    }
}
