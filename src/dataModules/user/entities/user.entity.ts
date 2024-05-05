import { Entity, Column, CreateDateColumn, PrimaryGeneratedColumn, OneToOne, Index } from "typeorm";
import { UserProfileEntity } from "./userProfile.entity";


@Entity('user')
@Index('IDX_email', ['email'], { unique: true })
@Index('IDX_username', ['username'], {})
export class UserEntity {

    @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
    id: number;

    @Column('varchar', { name: 'username', unique: true, length: 255 })
    username: string;

    @Column('varchar', { name: 'email', unique: true, length: 255 })
    email: string;

    @Column('varchar', { name: 'password', length: 255 })
    password: string;

    @CreateDateColumn({
        type: 'timestamp',
        name: 'createdAt',
        precision: 6,
        default: () => 'CURRENT_TIMESTAMP(6)'
    })
    createdAt: Date;

    @Column('timestamp', {
        name: 'updatedAt',
        default: () => 'CURRENT_TIMESTAMP',
        onUpdate: 'CURRENT_TIMESTAMP'
    })
    updatedAt: Date;

    @OneToOne((type) => UserProfileEntity, (profile) => profile.user)
    profile: UserProfileEntity;

}

