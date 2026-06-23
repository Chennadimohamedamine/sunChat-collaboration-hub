import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { StringValue } from 'ms';
import { User } from '../users/entities/user.entity';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
        private readonly mailService: MailService
    ) { }

    // ─── Login ────────────────────────────────────────────────────────────────────

    async login(email: string, password: string): Promise<{ accessToken: string; refreshToken: string;}> {
        const user = await this.usersService.findByEmail(email.trim().toLowerCase());

        if (!user) throw new UnauthorizedException('Invalid email or password');

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) throw new UnauthorizedException('Invalid email or password');
        if (user.isDeleted) throw new UnauthorizedException('Account deleted');
        if (user.isBlocked) throw new UnauthorizedException('Account blocked');
        if (!user.isVerified) throw new UnauthorizedException('Email not verified');

        const { accessToken, refreshToken } = await this.generateTokens(user.id, user.role);
        await this.saveRefreshToken(user.id, refreshToken);

        return { accessToken, refreshToken};

    }

    // ─── Register ────────────────────────────────────────────────────────────────
    async register(
        email: string,
        password: string,
        username: string,
        fullname: string,
        confirmPassword?: string,
    ): Promise<{ message: string }> {
        const normalizedEmail = email.trim().toLowerCase();
        const normalizedUsername = username.trim();
        const normalizedFullName = fullname.trim();

        if (confirmPassword && password !== confirmPassword) {
            throw new BadRequestException('Passwords do not match');
        }

        const existingUser = await this.usersService.findByEmail(normalizedEmail);
        if (existingUser) throw new BadRequestException('Email already in use');
        const existingUsername = await this.usersService.findByUsername(normalizedUsername);
        if (existingUsername) throw new BadRequestException('Username already in use');

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

    // ─── logout  ─────────────────────────────────────────────────────────────
    async logout(userId: string): Promise<{ message: string }> {
        await this.usersService.update(userId, { refreshToken: null, refreshTokenExpires: null });
        return { message: 'Logged out successfully' };
    }

    async refreshTokens(userId: string, refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
        const user = await this.usersService.findById(userId);
        if (!user || !user.refreshToken || !user.refreshTokenExpires) {
            throw new UnauthorizedException('Invalid refresh token');
        }

        if (user.refreshTokenExpires < new Date()) {
            throw new UnauthorizedException('Refresh token expired');
        }

        const isRefreshTokenValid = await bcrypt.compare(refreshToken, user.refreshToken);
        if (!isRefreshTokenValid) {
            throw new UnauthorizedException('Invalid refresh token');
        }

        const { accessToken, refreshToken: newRefreshToken } = await this.generateTokens(user.id, user.role);
        await this.saveRefreshToken(user.id, newRefreshToken);

        return { accessToken, refreshToken: newRefreshToken };
    }

    // ─── Verify Email & Resend Verification  ─────────────────────────────────────────────────────────────
    async verifyEmail(token: string): Promise<{
        accessToken : string , refreshToken : string
    }> {
        const user = await this.usersService.findByVerificationToken(token);

        if (!user) throw new NotFoundException('Invalid verification token');
        if (!user.verificationTokenExpires || user.verificationTokenExpires < new Date()) throw new BadRequestException('Verification token has expired. Please request a new one.');

        await this.usersService.update(user.id, {
            isVerified: true, isActive: true,
            verifiedAt: new Date(), verificationToken: null, verificationTokenExpires: null
        });

        const { accessToken, refreshToken } = await this.generateTokens(user.id, user.role);
        await this.saveRefreshToken(user.id, refreshToken);
        return { accessToken, refreshToken };
    }
    
    async resendVerification(email: string): Promise<{ message: string }> {
        const normalizedEmail = email.trim().toLowerCase();
        const user = await this.usersService.findByEmail(normalizedEmail);

        if (!user) throw new NotFoundException('User not found');
        if (user.isVerified) throw new BadRequestException('Email is already verified');

        const verificationToken = crypto.randomBytes(32).toString('hex');
        const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

        await this.usersService.update(user.id, {
            verificationToken,
            verificationTokenExpires,
        });

        await this.mailService.sendVerificationEmail(normalizedEmail, verificationToken);

        return { message: 'Verification email resent.' };
    }
    // ─── logout  ─────────────────────────────────────────────────────────────
        async getProfile(userId: string): Promise<Partial<User>> {
            const user = await this.usersService.findById(userId);
            if (!user) throw new NotFoundException('User not found');
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

    // ─── forgot password and rest password ────────────────────────────────────────────────────────────────────
    async forgotPassword(email: string): Promise<{ message: string }> {
        const normalizedEmail = email.trim().toLowerCase();
        const user = await this.usersService.findByEmail(normalizedEmail);
        if (!user) throw new NotFoundException('User not found');

        const resetPasswordToken = crypto.randomBytes(32).toString('hex');
        const resetPasswordExpires = new Date(Date.now() + 1 * 60 * 60 * 1000);

        await this.usersService.update(user.id, {
            resetPasswordToken,
            resetPasswordExpires,
        });

        await this.mailService.sendPasswordResetEmail(normalizedEmail, resetPasswordToken);

        return { message: 'Password reset email sent. Please check your inbox.' };
    }

    async resetPassword(token: string, newPassword: string , confirmPassword : string): Promise<{ message: string }> {
        if(newPassword !== confirmPassword) throw new BadRequestException('Passwords do not match');

        const user = await this.usersService.findByResetToken(token);
        if (!user) throw new NotFoundException('Invalid reset token');
        if (!user.resetPasswordExpires || user.resetPasswordExpires < new Date()) throw new BadRequestException('Reset token has expired. Please request a new one.');
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await this.usersService.update(user.id, {
            password: hashedPassword,
            resetPasswordToken: null,
            resetPasswordExpires: null,
        });

        return { message: 'Password reset successful. You can now log in with your new password.' };
    }

    async verifyResetToken(token: string): Promise<{ message: string }> {
        const user = await this.usersService.findByResetToken(token);
        if (!user) throw new NotFoundException('Invalid reset token');
        if (!user.resetPasswordExpires || user.resetPasswordExpires < new Date()) throw new BadRequestException('Reset token has expired. Please request a new one.');

        return { message: 'Reset token is valid. You can proceed to reset your password.' };
    }
    // ─── function utils ────────────────────────────────────────────────────────────────────

    private async generateTokens(userId: string, role: string) {
        const payload: { sub: string; role: string } = { sub: userId, role };

        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(payload, {
                secret: this.configService.get<string>('JWT_SECRET'),
                expiresIn: (this.configService.get<string>('JWT_EXPIRES_IN') ?? '15m') as StringValue,
            }),

            this.jwtService.signAsync(payload, {
                secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
                expiresIn: (this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') ?? '7d') as StringValue,
            }),
        ]);

        return { accessToken, refreshToken };
    }
    private async saveRefreshToken(userId: string, refreshToken: string) {
        const hashedToken = await bcrypt.hash(refreshToken, 10);
        const refreshTokenExpires = new Date(Date.now() + this.getRefreshTokenExpirationMs());

        await this.usersService.update(userId, {
            refreshToken: hashedToken,
            refreshTokenExpires,
        });
    }

    private getRefreshTokenExpirationMs(): number {
        const rawExpiresIn = this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') ?? '7d';
        const match = /^(\d+)([smhd])$/.exec(rawExpiresIn.trim());

        if (!match) {
            return 7 * 24 * 60 * 60 * 1000;
        }

        const value = Number(match[1]);
        const unit = match[2];
        const multiplier: Record<string, number> = {
            s: 1000,
            m: 60 * 1000,
            h: 60 * 60 * 1000,
            d: 24 * 60 * 60 * 1000,
        };

        return value * multiplier[unit];
    }

    private sanitizeUser(user: User): Partial<User> {
        const { password, refreshToken, verificationToken, resetPasswordToken, ...safe } = user;
        return safe;
    }
}
