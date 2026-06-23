import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) { }

    async findByEmail(email: string): Promise<User | null> {
        return this.userRepository
            .createQueryBuilder('user')
            .where('LOWER(user.email) = LOWER(:email)', { email })
            .getOne();
    }

    async findByUsername(username: string): Promise<User | null> {
        return this.userRepository
            .createQueryBuilder('user')
            .where('LOWER(user.username) = LOWER(:username)', { username })
            .getOne();
    }

    async findById(id: string): Promise<User | null> {
        return this.userRepository.findOne({ where: { id } });
    }

    async getUserNameById(id: string): Promise<string | null> {
        const user = await this.userRepository.findOne({ where: { id } });
        return user ? user.username : null;
    }

    async findByVerificationToken(token: string): Promise<User | null> {
        return this.userRepository.findOne({ where: { verificationToken: token } });
    }

    async findByResetToken(token: string): Promise<User | null> {
        return this.userRepository.findOne({ where: { resetPasswordToken: token } });
    }

    async findByRefreshToken(token: string): Promise<User | null> {
        return this.userRepository.findOne({ where: { refreshToken: token } });
    }

    async save(user: Partial<User>): Promise<User> {
        return this.userRepository.save(user);
    }

    async update(id: string, data: Partial<User>): Promise<void> {
        await this.userRepository.update(id, data);
    }

    async validUserName(username: string): Promise<{ valid: boolean }> {
        const normalizedUsername = username?.trim();
        if (!normalizedUsername || normalizedUsername.length < 3) {
            return { valid: false };
        }

        const existingUser = await this.findByUsername(normalizedUsername);
        return { valid: !existingUser };
    }

    async searchUsers(query: string): Promise<Partial<User>[]> {
        if (!query || query.trim().length < 2) {
            return [];
        }

        const searchTerm = `%${query.trim()}%`;
        const users = await this.userRepository
            .createQueryBuilder('user')
            .where('LOWER(user.username) LIKE LOWER(:query)', { query: searchTerm })
            .orWhere('LOWER(user.fullname) LIKE LOWER(:query)', { query: searchTerm })
            .orWhere('LOWER(user.email) LIKE LOWER(:query)', { query: searchTerm })
            .limit(10)
            .getMany();

        return users.map(user => this.sanitizeUser(user));
    }

    async getProfile(id: string): Promise<Partial<User>> {
        const user = await this.findById(id);
        if (!user) {
            throw new NotFoundException('User not found');
        }

        return this.sanitizeUser(user);
    }
    async updateProfile(id: string, dto: UpdateUserDto): Promise<Partial<User>> {
        const user = await this.findById(id);
        if (!user) {
            throw new NotFoundException('User not found');
        }
        const payload: Partial<User> = {};
        if (dto.fullname) payload.fullname = dto.fullname.trim();

        // Use optional chaining or safe check before calling .trim()
        if (dto.phoneNumber) payload.phoneNumber = dto.phoneNumber.trim();
        if (dto.profilePicture) payload.profilePicture = dto.profilePicture.trim();
        if (dto.bio) payload.bio = dto.bio.trim();
        if (dto.status !== undefined) payload.status = dto.status;

        await this.update(id, payload);
        const updatedUser = await this.findById(id);
        if (!updatedUser) {
            throw new NotFoundException('User not found');
        }

        return this.sanitizeUser(updatedUser);
    }

    private sanitizeUser(user: User): Partial<User> {
        const {
            password,
            refreshToken,
            verificationToken,
            resetPasswordToken,
            ...safeUser
        } = user;

        return safeUser;
    }
}
