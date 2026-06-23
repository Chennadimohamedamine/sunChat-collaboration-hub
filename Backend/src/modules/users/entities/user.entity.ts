import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    Index,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';

export enum UserRole {
    USER = 'user',
    ADMIN = 'admin',
}

export enum TimeZone{
    UTC = 'UTC',
    GMT = 'GMT',
    EST = 'EST',
    CST = 'CST',
    MST = 'MST',
    PST = 'PST',
    CET = 'CET',
    EET = 'EET',
    IST = 'IST',
    JST = 'JST',
    AEST = 'AEST',
}

export enum  UserStatus {
    ONLINE = 'online',
    OFFLINE = 'offline',
    AWAY = 'away',
}

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Index()
    @Column({ unique: true })
    email: string;

    @Index()
    @Column({ unique: true, nullable: true })
    username: string;

    @Column()
    fullname: string;

    @Column()
    password: string;

    @Column({ nullable: true })
    phoneNumber: string;

    @Column({ nullable: true })
    profilePicture: string;

    @Column({ nullable: true })
    bio: string;

    @Column({ type: 'varchar', default: TimeZone.UTC })
    timeZone: string;

    @Column({ type: 'varchar', default: UserStatus.OFFLINE })
    status: string;


    @Column({
        type: 'varchar',
        default: UserRole.USER,
    })
    role: string;

    @Column({ default: false })
    isActive: boolean;

    @Column({ default: false })
    isBlocked: boolean;

    @Column({ default: false})
    isDeleted: boolean;

    @Column({ default: false })
    isVerified: boolean;

    @Column({ nullable: true })
    verifiedAt: Date;

    @Index()
    @Column({ nullable: true, type: 'varchar' })
    verificationToken: string | null;

    @Column({ type: 'datetime', nullable: true })
    verificationTokenExpires: Date | null;

    @Index()
    @Column({ nullable: true, type: 'varchar' })
    resetPasswordToken: string | null;

    @Column({ type: 'datetime', nullable: true })
    resetPasswordExpires: Date | null;

    @Column({ type: 'varchar', nullable: true })
    refreshToken: string | null;

    @Column({ type: 'datetime', nullable: true })
    refreshTokenExpires: Date | null;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn()
    deletedAt: Date;
}