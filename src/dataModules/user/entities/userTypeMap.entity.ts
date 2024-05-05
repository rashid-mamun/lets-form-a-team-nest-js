import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";


@Entity('user-type-map')
export class UserTypeMapEntity {

    @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
    id: number

    @Column('int', { name: 'userTypeId', nullable: false, })
    userTypeId: number;

    @Column('int', { name: 'userId', nullable: false, })
    userId: number;


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