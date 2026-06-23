import { ExecutionContext } from '@nestjs/common';
declare const JwtAuthGuard_base: import("@nestjs/passport").Type<import("@nestjs/passport").IAuthGuard>;
export declare class JwtAuthGuard extends JwtAuthGuard_base {
    handleRequest<TUser = {
        id: string;
        role: string;
    }>(err: unknown, user: TUser, info: {
        name?: string;
    } | undefined, _context: ExecutionContext): TUser;
}
declare const RefreshAuthGuard_base: import("@nestjs/passport").Type<import("@nestjs/passport").IAuthGuard>;
export declare class RefreshAuthGuard extends RefreshAuthGuard_base {
}
export {};
