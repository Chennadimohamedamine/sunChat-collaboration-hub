import { TimeZone, UserStatus } from '../entities/user.entity';
export declare class UpdateUserDto {
    fullname?: string;
    phoneNumber?: string;
    profilePicture?: string;
    bio?: string;
    timeZone?: TimeZone;
    status?: UserStatus;
}
