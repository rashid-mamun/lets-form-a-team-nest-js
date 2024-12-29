import { Entity, Column, CreateDateColumn, PrimaryGeneratedColumn } from "typeorm";


@Entity('user-type-map')
export class UserTypeMapEntity {

    @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
    id: number;

    @Column('int', { name: 'userTypeId' })
    userTypeId: number;

    @Column('int', { name: 'userId', })
    userId: number;

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

}