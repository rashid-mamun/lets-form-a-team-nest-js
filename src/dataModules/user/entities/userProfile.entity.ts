import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { UserEntity } from "./user.entity";


@Entity('user-profile')
export class UserProfileEntity {

    @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
    id: number

    @Column('varchar', { name: 'name', length: 255 })
    name: string;

    @Column('varchar', { name: 'contactNumber', length: 255 })
    contactNumber: string;

    @Column('varchar', { name: 'authUserId', nullable: false, length: 255 })
    authUserId: string;


    @Column({
        type: 'timestamp',
        name: 'createdAt',
        precision: 6,
        default: () => 'CURRENT_TIMESTAMP(6)'
    })
    createdAt: Date;

    @Column('timestamp', {
        name: 'updatedAt',
        precision: 6,
        default: () => 'CURRENT_TIMESTAMP(6)',
    })
    updatedAt: Date;

    @OneToOne((type) => UserEntity, (user) => user.profile)
    @JoinColumn()
    user: UserEntity;


}