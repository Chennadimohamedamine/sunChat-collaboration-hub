import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';
import { UsersService } from "../../users/users.service";
interface RefreshJwtPayload {
    sub: string;
    role: string;
}
declare const RefreshStrategy_base: new (...args: any) => any;
export declare class RefreshStrategy extends RefreshStrategy_base {
    private readonly configService;
    private readonly usersService;
    constructor(configService: ConfigService, usersService: UsersService);
    validate(req: Request, payload: RefreshJwtPayload): Promise<{
        id: string;
        role: string;
        refreshToken: string;
    }>;
}
export {};
