import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { EntityClassOrSchema } from "@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type";
import { UserEntity } from "./user/entities/user.entity";
import { UserProfileEntity } from "./user/entities/userProfile.entity";
import { UserTypeEntity } from "./user/entities/userType.entity";
import { UserTypeMapEntity } from "./user/entities/userTypeMap.entity";


const entities: EntityClassOrSchema[] = [
    UserEntity,
    UserProfileEntity,
    UserTypeEntity,
    UserTypeMapEntity
];
const providers = [

];

@Module({
    imports: [TypeOrmModule.forFeature(entities)],
    // providers: providers,
    // exports: providers
})

export class DataModule { }