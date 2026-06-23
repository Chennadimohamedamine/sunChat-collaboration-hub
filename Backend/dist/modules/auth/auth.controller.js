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
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("./auth.service");
const login_dto_1 = require("./dto/login.dto");
const register_dto_1 = require("./dto/register.dto");
const config_1 = require("@nestjs/config");
const jwt_auth_guard_1 = require("./guards/jwt-auth.guard");
const utils_dto_1 = require("./dto/utils.dto");
let AuthController = class AuthController {
    authService;
    configService;
    constructor(authService, configService) {
        this.authService = authService;
        this.configService = configService;
    }
    async login(dto, res) {
        try {
            const { accessToken, refreshToken } = await this.authService.login(dto.email, dto.password);
            if (accessToken && refreshToken) {
                res.cookie('accessToken', accessToken, {
                    httpOnly: true,
                    secure: false,
                    sameSite: 'lax',
                    maxAge: 2 * 24 * 60 * 60 * 1000,
                });
                res.cookie('refreshToken', refreshToken, {
                    httpOnly: true,
                    secure: false,
                    sameSite: 'lax',
                    maxAge: 7 * 24 * 60 * 60 * 1000,
                });
            }
            else
                throw new Error('Failed to generate tokens');
            return res.json({ message: 'Login successful', accessToken });
        }
        catch (error) {
            res.clearCookie('accessToken');
            res.clearCookie('refreshToken');
            const status = error.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR;
            const message = error.message || 'Internal server error';
            res.status(status).json({ message });
        }
    }
    async register(dto, res) {
        try {
            const result = await this.authService.register(dto.email, dto.password, dto.username, dto.fullName, dto.confirmPassword);
            res.json(result);
        }
        catch (error) {
            const status = error.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR;
            const message = error.message || 'Internal server error';
            res.status(status).json({ message });
        }
    }
    async verifyEmail(token, res) {
        const frontendUrl = this.configService.get('FRONTEND_URL');
        if (!token)
            res.redirect(`${frontendUrl}/status-callback?status=error&message=No%20token%20provided.`);
        try {
            const { accessToken, refreshToken } = await this.authService.verifyEmail(token);
            if (accessToken && refreshToken) {
                res.cookie('accessToken', accessToken, {
                    httpOnly: true,
                    secure: false,
                    sameSite: 'lax',
                    maxAge: 2 * 24 * 60 * 60 * 1000,
                });
                res.cookie('refreshToken', refreshToken, {
                    httpOnly: true,
                    secure: false,
                    sameSite: 'lax',
                    maxAge: 7 * 24 * 60 * 60 * 1000,
                });
                res.redirect(`${frontendUrl}/status-callback?status=success&accessToken=${accessToken}`);
            }
            else {
                res.redirect(`${frontendUrl}/status-callback?status=error&message=Failed%20to%20generate%20tokens.`);
            }
        }
        catch (error) {
            return res.redirect(`${frontendUrl}/status-callback?status=unverified`);
        }
    }
    async resetPassword(token, res) {
        const frontendUrl = this.configService.get('FRONTEND_URL');
        try {
            const { message } = await this.authService.verifyResetToken(token);
            return res.redirect(`${frontendUrl}/resetPassword/callback?status=restSuccess&message=${encodeURIComponent(message)}&resetToken=${encodeURIComponent(token)}`);
        }
        catch (error) {
            const msg = error.message || 'Invalid or expired reset token';
            return res.redirect(`${frontendUrl}/status/callback?status=error&message=${encodeURIComponent(msg)}`);
        }
    }
    async handleResetPassword(dto) {
        return await this.authService.resetPassword(dto.token, dto.newPassword, dto.confirmPassword);
    }
    async resendVerification(dto) {
        return await this.authService.resendVerification(dto.email);
    }
    async refresh(req, res) {
        const { accessToken, refreshToken } = await this.authService.refreshTokens(req.user.id, req.user.refreshToken);
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            maxAge: 2 * 24 * 60 * 60 * 1000,
        });
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        return res.json({ accessToken });
    }
    async logout(req, res) {
        const result = await this.authService.logout(req.user.id);
        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');
        return res.json(result);
    }
    async getMe(req) {
        const { id } = req.user;
        if (!id)
            throw new common_1.UnauthorizedException();
        return this.authService.getProfile(id);
    }
    forgotPassword(dto) {
        return this.authService.forgotPassword(dto.email);
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('login'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [login_dto_1.loginDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('register'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [register_dto_1.registerDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "register", null);
__decorate([
    (0, common_1.Get)('verify-email'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Query)('token')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verifyEmail", null);
__decorate([
    (0, common_1.Get)('reset-password'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Query)('token')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "resetPassword", null);
__decorate([
    (0, common_1.Post)('reset-password'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [utils_dto_1.ResetPasswordDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "handleResetPassword", null);
__decorate([
    (0, common_1.Post)('resend-verification'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [utils_dto_1.ResendVerificationDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "resendVerification", null);
__decorate([
    (0, common_1.Post)('refresh'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.UseGuards)(jwt_auth_guard_1.RefreshAuthGuard),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "refresh", null);
__decorate([
    (0, common_1.Post)('logout'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logout", null);
__decorate([
    (0, common_1.Get)('me'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getMe", null);
__decorate([
    (0, common_1.Post)('forgot-password'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [utils_dto_1.ForgotPasswordDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "forgotPassword", null);
exports.AuthController = AuthController = __decorate([
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        config_1.ConfigService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map