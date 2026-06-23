import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    searchUsers(query: string): Promise<Partial<import("./entities/user.entity").User>[]>;
    validUserName(query: string): Promise<{
        valid: boolean;
    }>;
    getProfile(id: string): Promise<Partial<import("./entities/user.entity").User>>;
    updateProfile(id: string, dto: UpdateUserDto, req: {
        user: {
            id: string;
        };
    }): Promise<Partial<import("./entities/user.entity").User>>;
}
