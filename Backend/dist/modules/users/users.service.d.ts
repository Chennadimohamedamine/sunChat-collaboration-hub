import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
export declare class UsersService {
    private readonly userRepository;
    constructor(userRepository: Repository<User>);
    findByEmail(email: string): Promise<User | null>;
    findByUsername(username: string): Promise<User | null>;
    findById(id: string): Promise<User | null>;
    getUserNameById(id: string): Promise<string | null>;
    findByVerificationToken(token: string): Promise<User | null>;
    findByResetToken(token: string): Promise<User | null>;
    findByRefreshToken(token: string): Promise<User | null>;
    save(user: Partial<User>): Promise<User>;
    update(id: string, data: Partial<User>): Promise<void>;
    validUserName(username: string): Promise<{
        valid: boolean;
    }>;
    searchUsers(query: string): Promise<Partial<User>[]>;
    getProfile(id: string): Promise<Partial<User>>;
    updateProfile(id: string, dto: UpdateUserDto): Promise<Partial<User>>;
    private sanitizeUser;
}
