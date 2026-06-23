export declare enum UserRole {
    USER = "user",
    ADMIN = "admin"
}
export declare enum TimeZone {
    UTC = "UTC",
    GMT = "GMT",
    EST = "EST",
    CST = "CST",
    MST = "MST",
    PST = "PST",
    CET = "CET",
    EET = "EET",
    IST = "IST",
    JST = "JST",
    AEST = "AEST"
}
export declare enum UserStatus {
    ONLINE = "online",
    OFFLINE = "offline",
    AWAY = "away"
}
export declare class User {
    id: string;
    email: string;
    username: string;
    fullname: string;
    password: string;
    phoneNumber: string;
    profilePicture: string;
    bio: string;
    timeZone: string;
    status: string;
    role: string;
    isActive: boolean;
    isBlocked: boolean;
    isDeleted: boolean;
    isVerified: boolean;
    verifiedAt: Date;
    verificationToken: string | null;
    verificationTokenExpires: Date | null;
    resetPasswordToken: string | null;
    resetPasswordExpires: Date | null;
    refreshToken: string | null;
    refreshTokenExpires: Date | null;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date;
}
