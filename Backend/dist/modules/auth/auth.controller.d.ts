import { AuthService } from './auth.service';
import { loginDto } from './dto/login.dto';
import type { Response } from 'express';
import { registerDto } from './dto/register.dto';
import { ConfigService } from '@nestjs/config';
import { ForgotPasswordDto, ResendVerificationDto, ResetPasswordDto } from './dto/utils.dto';
export declare class AuthController {
    private readonly authService;
    private readonly configService;
    constructor(authService: AuthService, configService: ConfigService);
    login(dto: loginDto, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    register(dto: registerDto, res: Response): Promise<void>;
    verifyEmail(token: string, res: Response): Promise<void>;
    resetPassword(token: string, res: Response): Promise<void>;
    handleResetPassword(dto: ResetPasswordDto): Promise<{
        message: string;
    }>;
    resendVerification(dto: ResendVerificationDto): Promise<{
        message: string;
    }>;
    refresh(req: {
        user: {
            id: string;
            refreshToken: string;
        };
    }, res: Response): Promise<Response<any, Record<string, any>>>;
    logout(req: {
        user: {
            id: string;
        };
    }, res: Response): Promise<Response<any, Record<string, any>>>;
    getMe(req: {
        user: {
            id: string;
            role: string;
        };
    }): Promise<Partial<import("../users/entities/user.entity").User>>;
    forgotPassword(dto: ForgotPasswordDto): Promise<{
        message: string;
    }>;
}
