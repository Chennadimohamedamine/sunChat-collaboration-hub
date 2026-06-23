import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest<TUser = { id: string; role: string }>(
    err: unknown,
    user: TUser,
    info: { name?: string } | undefined,
    _context: ExecutionContext,
  ): TUser {
    if (info?.name === 'TokenExpiredError') {
      throw new UnauthorizedException('TOKEN_EXPIRED');
    }

    if (err || !user) {
      throw new UnauthorizedException('Unauthorized');
    }

    return user;
  }
}

@Injectable()
export class RefreshAuthGuard extends AuthGuard('jwt-refresh') {}
