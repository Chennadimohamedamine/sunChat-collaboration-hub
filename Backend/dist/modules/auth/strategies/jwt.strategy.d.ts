import { ConfigService } from '@nestjs/config';
import { UsersService } from "../../users/users.service";
interface JwtPayload {
    sub: string;
    role: string;
}
declare const JwtStrategy_base: new (...args: any) => any;
export declare class JwtStrategy extends JwtStrategy_base {
    private readonly configService;
    private readonly usersService;
    constructor(configService: ConfigService, usersService: UsersService);
    validate(payload: JwtPayload): Promise<{
        id: string;
        role: string;
    }>;
}
export {};
