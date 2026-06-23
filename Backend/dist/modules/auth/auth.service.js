"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const users_service_1 = require("../users/users.service");
const bcrypt = __importStar(require("bcrypt"));
const crypto = __importStar(require("crypto"));
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const mail_service_1 = require("../../mail/mail.service");
let AuthService = class AuthService {
    usersService;
    jwtService;
    configService;
    mailService;
    constructor(usersService, jwtService, configService, mailService) {
        this.usersService = usersService;
        this.jwtService = jwtService;
        this.configService = configService;
        this.mailService = mailService;
    }
    async login(email, password) {
        const user = await this.usersService.findByEmail(email.trim().toLowerCase());
        if (!user)
            throw new common_1.UnauthorizedException('Invalid email or password');
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid)
            throw new common_1.UnauthorizedException('Invalid email or password');
        if (user.isDeleted)
            throw new common_1.UnauthorizedException('Account deleted');
        if (user.isBlocked)
            throw new common_1.UnauthorizedException('Account blocked');
        if (!user.isVerified)
            throw new common_1.UnauthorizedException('Email not verified');
        const { accessToken, refreshToken } = await this.generateTokens(user.id, user.role);
        await this.saveRefreshToken(user.id, refreshToken);
        return { accessToken, refreshToken };
    }
    async register(email, password, username, fullname, confirmPassword) {
        const normalizedEmail = email.trim().toLowerCase();
        const normalizedUsername = username.trim();
        const normalizedFullName = fullname.trim();
        if (confirmPassword && password !== confirmPassword) {
            throw new common_1.BadRequestException('Passwords do not match');
        }
        const existingUser = await this.usersService.findByEmail(normalizedEmail);
        if (existingUser)
            throw new common_1.BadRequestException('Email already in use');
        const existingUsername = await this.usersService.findByUsername(normalizedUsername);
        if (existingUsername)
            throw new common_1.BadRequestException('Username already in use');
        const hashedPassword = await bcrypt.hash(password, 10);
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const verificationTokenExpires = new Date(Date.now() + 1 * 60 * 60 * 1000);
        await this.usersService.save({
            email: normalizedEmail,
            password: hashedPassword,
            username: normalizedUsername,
            fullname: normalizedFullName,
            verificationToken,
            verificationTokenExpires,
            profilePicture: `https://ui-avatars.com/api/?name=${encodeURIComponent(normalizedUsername)}`,
        });
        await this.mailService.sendVerificationEmail(normalizedEmail, verificationToken);
        return { message: 'Registration successful. Please check your email to verify your account.' };
    }
    async logout(userId) {
        await this.usersService.update(userId, { refreshToken: null, refreshTokenExpires: null });
        return { message: 'Logged out successfully' };
    }
    async refreshTokens(userId, refreshToken) {
        const user = await this.usersService.findById(userId);
        if (!user || !user.refreshToken || !user.refreshTokenExpires) {
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
        if (user.refreshTokenExpires < new Date()) {
            throw new common_1.UnauthorizedException('Refresh token expired');
        }
        const isRefreshTokenValid = await bcrypt.compare(refreshToken, user.refreshToken);
        if (!isRefreshTokenValid) {
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
        const { accessToken, refreshToken: newRefreshToken } = await this.generateTokens(user.id, user.role);
        await this.saveRefreshToken(user.id, newRefreshToken);
        return { accessToken, refreshToken: newRefreshToken };
    }
    async verifyEmail(token) {
        const user = await this.usersService.findByVerificationToken(token);
        if (!user)
            throw new common_1.NotFoundException('Invalid verification token');
        if (!user.verificationTokenExpires || user.verificationTokenExpires < new Date())
            throw new common_1.BadRequestException('Verification token has expired. Please request a new one.');
        await this.usersService.update(user.id, {
            isVerified: true, isActive: true,
            verifiedAt: new Date(), verificationToken: null, verificationTokenExpires: null
        });
        const { accessToken, refreshToken } = await this.generateTokens(user.id, user.role);
        await this.saveRefreshToken(user.id, refreshToken);
        return { accessToken, refreshToken };
    }
    async resendVerification(email) {
        const normalizedEmail = email.trim().toLowerCase();
        const user = await this.usersService.findByEmail(normalizedEmail);
        if (!user)
            throw new common_1.NotFoundException('User not found');
        if (user.isVerified)
            throw new common_1.BadRequestException('Email is already verified');
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
        await this.usersService.update(user.id, {
            verificationToken,
            verificationTokenExpires,
        });
        await this.mailService.sendVerificationEmail(normalizedEmail, verificationToken);
        return { message: 'Verification email resent.' };
    }
    async getProfile(userId) {
        const user = await this.usersService.findById(userId);
        if (!user)
            throw new common_1.NotFoundException('User not found');
        return {
            id: user.id,
            email: user.email,
            username: user.username,
            fullname: user.fullname,
            phoneNumber: user.phoneNumber,
            profilePicture: user.profilePicture,
            bio: user.bio,
            timeZone: user.timeZone,
            status: user.status,
            role: user.role,
        };
    }
    async forgotPassword(email) {
        const normalizedEmail = email.trim().toLowerCase();
        const user = await this.usersService.findByEmail(normalizedEmail);
        if (!user)
            throw new common_1.NotFoundException('User not found');
        const resetPasswordToken = crypto.randomBytes(32).toString('hex');
        const resetPasswordExpires = new Date(Date.now() + 1 * 60 * 60 * 1000);
        await this.usersService.update(user.id, {
            resetPasswordToken,
            resetPasswordExpires,
        });
        await this.mailService.sendPasswordResetEmail(normalizedEmail, resetPasswordToken);
        return { message: 'Password reset email sent. Please check your inbox.' };
    }
    async resetPassword(token, newPassword, confirmPassword) {
        if (newPassword !== confirmPassword)
            throw new common_1.BadRequestException('Passwords do not match');
        const user = await this.usersService.findByResetToken(token);
        if (!user)
            throw new common_1.NotFoundException('Invalid reset token');
        if (!user.resetPasswordExpires || user.resetPasswordExpires < new Date())
            throw new common_1.BadRequestException('Reset token has expired. Please request a new one.');
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await this.usersService.update(user.id, {
            password: hashedPassword,
            resetPasswordToken: null,
            resetPasswordExpires: null,
        });
        return { message: 'Password reset successful. You can now log in with your new password.' };
    }
    async verifyResetToken(token) {
        const user = await this.usersService.findByResetToken(token);
        if (!user)
            throw new common_1.NotFoundException('Invalid reset token');
        if (!user.resetPasswordExpires || user.resetPasswordExpires < new Date())
            throw new common_1.BadRequestException('Reset token has expired. Please request a new one.');
        return { message: 'Reset token is valid. You can proceed to reset your password.' };
    }
    async generateTokens(userId, role) {
        const payload = { sub: userId, role };
        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(payload, {
                secret: this.configService.get('JWT_SECRET'),
                expiresIn: (this.configService.get('JWT_EXPIRES_IN') ?? '15m'),
            }),
            this.jwtService.signAsync(payload, {
                secret: this.configService.get('JWT_REFRESH_SECRET'),
                expiresIn: (this.configService.get('JWT_REFRESH_EXPIRES_IN') ?? '7d'),
            }),
        ]);
        return { accessToken, refreshToken };
    }
    async saveRefreshToken(userId, refreshToken) {
        const hashedToken = await bcrypt.hash(refreshToken, 10);
        const refreshTokenExpires = new Date(Date.now() + this.getRefreshTokenExpirationMs());
        await this.usersService.update(userId, {
            refreshToken: hashedToken,
            refreshTokenExpires,
        });
    }
    getRefreshTokenExpirationMs() {
        const rawExpiresIn = this.configService.get('JWT_REFRESH_EXPIRES_IN') ?? '7d';
        const match = /^(\d+)([smhd])$/.exec(rawExpiresIn.trim());
        if (!match) {
            return 7 * 24 * 60 * 60 * 1000;
        }
        const value = Number(match[1]);
        const unit = match[2];
        const multiplier = {
            s: 1000,
            m: 60 * 1000,
            h: 60 * 60 * 1000,
            d: 24 * 60 * 60 * 1000,
        };
        return value * multiplier[unit];
    }
    sanitizeUser(user) {
        const { password, refreshToken, verificationToken, resetPasswordToken, ...safe } = user;
        return safe;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        jwt_1.JwtService,
        config_1.ConfigService,
        mail_service_1.MailService])
], AuthService);
//# sourceMappingURL=auth.service.js.map