import { Entity, Column, CreateDateColumn, PrimaryGeneratedColumn, OneToOne, Index, JoinColumn } from 'typeorm';
import { UserProfileEntity } from './userProfile.entity';

/**
 * Represents a user in the system with authentication details.
 */
@Entity('user')
@Index('IDX_username', ['username'], { unique: true })
export class UserEntity {
    @PrimaryGeneratedColumn({ type: 'int', name: 'id', comment: 'Unique identifier for the user' })
    id: number;

    @Column('varchar', { name: 'username', unique: true, length: 255, comment: 'Unique username for login' })
    username: string;

    @Column('varchar', { name: 'password', length: 255, comment: 'Hashed user password' })
    password: string;

    @CreateDateColumn({
        type: 'timestamp',
        name: 'createdAt',
        precision: 6,
        default: () => 'CURRENT_TIMESTAMP(6)',
        comment: 'Timestamp when the user was created',
    })
    createdAt: Date;

    @Column('timestamp', {
        name: 'updatedAt',
        default: () => 'CURRENT_TIMESTAMP',
        onUpdate: 'CURRENT_TIMESTAMP',
        comment: 'Timestamp when the user was last updated',
    })
    updatedAt: Date;

    @OneToOne(() => UserProfileEntity, (profile) => profile.user, { cascade: true })
    @JoinColumn()
    profile: UserProfileEntity;
}
