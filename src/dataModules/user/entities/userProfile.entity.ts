import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { UserEntity } from "./user.entity";


@Entity('user-profile')
export class UserProfileEntity {

    @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
    id: number

    @Column('varchar', { name: 'name', length: 255 })
    name: string;

    @Column('varchar', { name: 'email', unique: true, length: 255 })
    email: string;

    @Column('varchar', { name: 'contactNumber', length: 255 })
    contactNumber: string;

    @Column('varchar', { name: 'authUserId', nullable: false, length: 255 })
    authUserId: string;

    @Column('int', { name: 'createdBy', nullable: false, })
    createdBy: number;

    @Column('int', { name: 'updatedBy', nullable: false, })
    updatedBy: number;


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
}