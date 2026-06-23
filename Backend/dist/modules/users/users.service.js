"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const user_entity_1 = require("./entities/user.entity");
const typeorm_2 = require("typeorm");
let UsersService = class UsersService {
    userRepository;
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    async findByEmail(email) {
        return this.userRepository
            .createQueryBuilder('user')
            .where('LOWER(user.email) = LOWER(:email)', { email })
            .getOne();
    }
    async findByUsername(username) {
        return this.userRepository
            .createQueryBuilder('user')
            .where('LOWER(user.username) = LOWER(:username)', { username })
            .getOne();
    }
    async findById(id) {
        return this.userRepository.findOne({ where: { id } });
    }
    async getUserNameById(id) {
        const user = await this.userRepository.findOne({ where: { id } });
        return user ? user.username : null;
    }
    async findByVerificationToken(token) {
        return this.userRepository.findOne({ where: { verificationToken: token } });
    }
    async findByResetToken(token) {
        return this.userRepository.findOne({ where: { resetPasswordToken: token } });
    }
    async findByRefreshToken(token) {
        return this.userRepository.findOne({ where: { refreshToken: token } });
    }
    async save(user) {
        return this.userRepository.save(user);
    }
    async update(id, data) {
        await this.userRepository.update(id, data);
    }
    async validUserName(username) {
        const normalizedUsername = username?.trim();
        if (!normalizedUsername || normalizedUsername.length < 3) {
            return { valid: false };
        }
        const existingUser = await this.findByUsername(normalizedUsername);
        return { valid: !existingUser };
    }
    async searchUsers(query) {
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
    async getProfile(id) {
        const user = await this.findById(id);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        return this.sanitizeUser(user);
    }
    async updateProfile(id, dto) {
        const user = await this.findById(id);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const payload = {};
        if (dto.fullname)
            payload.fullname = dto.fullname.trim();
        if (dto.phoneNumber)
            payload.phoneNumber = dto.phoneNumber.trim();
        if (dto.profilePicture)
            payload.profilePicture = dto.profilePicture.trim();
        if (dto.bio)
            payload.bio = dto.bio.trim();
        if (dto.status !== undefined)
            payload.status = dto.status;
        await this.update(id, payload);
        const updatedUser = await this.findById(id);
        if (!updatedUser) {
            throw new common_1.NotFoundException('User not found');
        }
        return this.sanitizeUser(updatedUser);
    }
    sanitizeUser(user) {
        const { password, refreshToken, verificationToken, resetPasswordToken, ...safeUser } = user;
        return safeUser;
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], UsersService);
//# sourceMappingURL=users.service.js.map