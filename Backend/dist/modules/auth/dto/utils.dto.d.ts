export declare class RefreshTokenDto {
    refreshToken: string;
}
export declare class ForgotPasswordDto {
    email: string;
}
export declare class ResetPasswordDto {
    token: string;
    newPassword: string;
    confirmPassword: string;
}
export declare class ResendVerificationDto {
    email: string;
}
