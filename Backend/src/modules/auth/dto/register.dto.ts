import {
    IsEmail,
    IsNotEmpty,
    IsOptional,
    Matches,
    IsString,
    MaxLength,
    MinLength,
}
from 'class-validator';

export class registerDto {
   @IsString()
   @IsNotEmpty()
    @MinLength(3)
    @MaxLength(30)
    @Matches(/^[a-zA-Z0-9_]+$/)
    username: string;

    @IsString()
    @IsNotEmpty()
    fullName: string;

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @MinLength(6)
    @MaxLength(128)
    @IsNotEmpty()
    password: string;

    @IsOptional()
    @IsString()
    confirmPassword?: string;
}