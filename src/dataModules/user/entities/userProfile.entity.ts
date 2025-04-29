import { Column, Entity, PrimaryGeneratedColumn, OneToOne } from 'typeorm';
import { UserEntity } from './user.entity';

/**
 * Stores user profile information linked to a user.
 */
@Entity('user_profile')
export class UserProfileEntity {
    @PrimaryGeneratedColumn({ type: 'int', name: 'id', comment: 'Unique identifier for the profile' })
    id: number;

    @Column('varchar', { name: 'name', length: 255, comment: 'Full name of the user' })
    name: string;

    @Column('varchar', { name: 'email', unique: true, length: 255, comment: 'Unique email address' })
    email: string;

    @Column('varchar', { name: 'contactNumber', length: 255, comment: 'Contact phone number' })
    contactNumber: string;

    @Column('int', { name: 'userId', nullable: false, comment: 'Foreign key to user' })
    userId: number;

    @Column('int', { name: 'createdBy', nullable: false, comment: 'ID of user who created the profile' })
    createdBy: number;

    @Column('int', { name: 'updatedBy', nullable: false, comment: 'ID of user who last updated the profile' })
    updatedBy: number;

    @Column({
        type: 'timestamp',
        name: 'createdAt',
        precision: 6,
        default: () => 'CURRENT_TIMESTAMP(6)',
        comment: 'Timestamp when the profile was created',
    })
    createdAt: Date;

    @Column('timestamp', {
        name: 'updatedAt',
        precision: 6,
        default: () => 'CURRENT_TIMESTAMP(6)',
        onUpdate: 'CURRENT_TIMESTAMP(6)',
        comment: 'Timestamp when the profile was last updated',
    })
    updatedAt: Date;

    @OneToOne(() => UserEntity, (user) => user.profile)
    user: UserEntity;
}
