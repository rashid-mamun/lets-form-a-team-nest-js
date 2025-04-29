import { EUserTypes } from 'src/common/constants/common.enum';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('user-type')
export class UserTypeEntity {
    @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
    id: number;

    @Column('varchar', { name: 'userType', nullable: false, length: 255 })
    userType: string;

    @Column('int', { name: 'userTypeId', nullable: false })
    userTypeId: EUserTypes;

    @Column({
        type: 'timestamp',
        name: 'createdAt',
        precision: 6,
        default: () => 'CURRENT_TIMESTAMP(6)',
    })
    createdAt: Date;

    @Column('timestamp', {
        name: 'updatedAt',
        precision: 6,
        default: () => 'CURRENT_TIMESTAMP(6)',
    })
    updatedAt: Date;
}
