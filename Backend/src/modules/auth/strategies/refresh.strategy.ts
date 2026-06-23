import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { Request } from 'express';
import { UsersService } from 'src/modules/users/users.service';

interface RefreshJwtPayload {
  sub: string;
  role: string;
}

@Injectable()
export class RefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => req?.cookies?.refreshToken ?? null,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_REFRESH_SECRET'),
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: RefreshJwtPayload): Promise<{ id: string; role: string; refreshToken: string }> {
    const user = await this.usersService.findById(payload.sub);
    const refreshToken = req?.cookies?.refreshToken ?? null;

    if (!user || !refreshToken || !user.refreshToken || user.isBlocked || user.isDeleted || !user.isActive || !user.isVerified) {
      throw new UnauthorizedException('Access denied');
    }

    return { id: user.id, role: user.role, refreshToken };
  }
}