import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from 'src/modules/users/users.service';

interface JwtPayload {
    sub: string;
    role: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor(private readonly configService: ConfigService,
        private readonly usersService: UsersService,

    )
    {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                (req) => req?.cookies?.accessToken ?? null,
                ExtractJwt.fromAuthHeaderAsBearerToken(),
            ]),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('JWT_SECRET'),
        });
    }
    async validate(payload: JwtPayload): Promise<{ id: string; role: string }> {
        const user = await this.usersService.findById(payload.sub);
        if (!user || !user.isActive || user.isBlocked || user.isDeleted) {
            throw new UnauthorizedException('Access denied');
        }
        return { id: user.id, role: user.role };
    }

}
