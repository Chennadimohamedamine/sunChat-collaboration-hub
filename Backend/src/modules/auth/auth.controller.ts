import { Body, Controller, Get, HttpCode, HttpStatus, Post, Query, Req, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { loginDto } from './dto/login.dto';
import type { Response } from 'express';
import { registerDto } from './dto/register.dto';
import { ConfigService } from '@nestjs/config';
import { JwtAuthGuard, RefreshAuthGuard } from './guards/jwt-auth.guard';
import { ForgotPasswordDto, ResendVerificationDto, ResetPasswordDto } from './dto/utils.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService,
    private readonly configService: ConfigService
  ) { }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: loginDto, @Res() res: Response) {
    try {
      const { accessToken, refreshToken} = await this.authService.login(dto.email, dto.password);

      if (accessToken && refreshToken) {
        res.cookie('accessToken', accessToken, {
          httpOnly: true,
          secure: false,
          sameSite: 'lax',
          maxAge: 2 * 24 * 60 * 60 * 1000,
        });
        res.cookie('refreshToken', refreshToken, {
          httpOnly: true,
          secure: false,
          sameSite: 'lax',
          maxAge: 7 * 24 * 60 * 60 * 1000,
        });
      } else throw new Error('Failed to generate tokens');
      return res.json({ message : 'Login successful', accessToken });
    } catch (error) {
      res.clearCookie('accessToken');
      res.clearCookie('refreshToken');
      const status = error.status || HttpStatus.INTERNAL_SERVER_ERROR;
      const message = error.message || 'Internal server error';
      res.status(status).json({ message });
    }
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: registerDto, @Res() res: Response) {

    try {
      const result = await this.authService.register(dto.email, dto.password, dto.username, dto.fullName, dto.confirmPassword);
  
      res.json(result);
    } catch (error) {
      const status = error.status || HttpStatus.INTERNAL_SERVER_ERROR;
      const message = error.message || 'Internal server error';
      res.status(status).json({ message });
    }
  }

  @Get('verify-email')
  @HttpCode(HttpStatus.OK)
  async verifyEmail(@Query('token') token: string, @Res() res: Response) {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    if (!token) res.redirect(`${frontendUrl}/status-callback?status=error&message=No%20token%20provided.`);
  
    try {
      const { accessToken, refreshToken} = await this.authService.verifyEmail(token);
      if (accessToken && refreshToken) {
        res.cookie('accessToken', accessToken, {
          httpOnly: true,
          secure: false,
          sameSite: 'lax',
          maxAge: 2 * 24 * 60 * 60 * 1000,
        });
        res.cookie('refreshToken', refreshToken, {
          httpOnly: true,
          secure: false,
          sameSite: 'lax',
          maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        res.redirect(`${frontendUrl}/status-callback?status=success&accessToken=${accessToken}`);
      } else {
        res.redirect(`${frontendUrl}/status-callback?status=error&message=Failed%20to%20generate%20tokens.`);
      }
    } catch (error) {
      return res.redirect(`${frontendUrl}/status-callback?status=unverified`);
    }
  }

  @Get('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Query('token') token: string, @Res() res: Response) {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    try {
      const { message } = await this.authService.verifyResetToken(token);
      return res.redirect(`${frontendUrl}/resetPassword/callback?status=restSuccess&message=${encodeURIComponent(message)}&resetToken=${encodeURIComponent(token)}`);
    } catch (error) {
      const msg = error.message || 'Invalid or expired reset token';
      return res.redirect(`${frontendUrl}/status/callback?status=error&message=${encodeURIComponent(msg)}`);
    }
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async handleResetPassword(@Body() dto: ResetPasswordDto) {
    return await this.authService.resetPassword(dto.token, dto.newPassword, dto.confirmPassword);
  }

  @Post('resend-verification')
  @HttpCode(HttpStatus.OK)
  async resendVerification(@Body() dto: ResendVerificationDto) {
    return await this.authService.resendVerification(dto.email);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RefreshAuthGuard)
  async refresh(@Req() req: { user: { id: string; refreshToken: string } }, @Res() res: Response) {
    const { accessToken, refreshToken } = await this.authService.refreshTokens(req.user.id, req.user.refreshToken);

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 2 * 24 * 60 * 60 * 1000,
    });
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({ accessToken });
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async logout(@Req() req: { user: { id: string } } , @Res() res: Response) {
   const result = await this.authService.logout(req.user.id);
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    return res.json(result);
  }

  @Get('me')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async getMe(@Req() req: { user: { id: string; role: string } }) {
    const { id } = req.user;
    if (!id) throw new UnauthorizedException();
    return this.authService.getProfile(id);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email);
  }

}
