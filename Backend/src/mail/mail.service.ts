import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;

  constructor(
    private readonly configService: ConfigService
  ) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('EMAIL_HOST'),
      port: this.configService.get<number>('EMAIL_PORT'),
      secure: false,
      auth: {
        user: this.configService.get<string>('EMAIL_USER'),
        pass: this.configService.get<string>('EMAIL_PASSWORD'),
      },
    });
  }

  async sendVerificationEmail(email: string, token: string): Promise<void> {
    const verifyUrl = `${this.configService.get<string>('APP_URL')}/api/auth/verify-email?token=${token}`;

    await this.transporter.sendMail({
      from: `"Sunday Workspace" <${this.configService.get<string>('EMAIL_USER')}>`,
      to: email,
      subject: 'Verify your Sunday Account Parameters',
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F4F6F8; padding: 40px 20px; text-align: left;">
          <div style="max-width: 520px; margin: 0 auto; background-color: #ffffff; border-radius: 20px; border: 1px solid #E2E8F0; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.02);">
            <div style="background-color: #161B24; padding: 24px 32px; border-bottom: 2px solid #FF6B35;">
              <div style="display: inline-block; width: 32px; height: 32px; background-color: #FF6B35; border-radius: 8px; vertical-align: middle; margin-right: 12px;"></div>
              <span style="color: #ffffff; font-weight: 700; font-size: 14px; letter-spacing: 1.5px; font-family: monospace; vertical-align: middle; text-transform: uppercase;">SUNDAY ACCOUNT UTILITIES</span>
            </div>
            
            <div style="padding: 36px 32px;">
              <h2 style="color: #0F131A; font-size: 20px; font-weight: 700; margin-top: 0; margin-bottom: 12px; letter-spacing: -0.5px;">Verify your workspace node identity</h2>
              <p style="color: #64748B; font-size: 13px; line-height: 1.6; margin-bottom: 28px;">
                Welcome to Sunday. To activate your account parameter options and begin syncing with system nodes and Sunday AI, verify this email address. This operational link expires in 24 hours.
              </p>
              
              <div style="margin-bottom: 32px; text-align: center;">
                <a href="${verifyUrl}"
                   style="display: inline-block; padding: 14px 28px; background-color: #FF6B35; color: #ffffff; border-radius: 12px; text-decoration: none; font-size: 12px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase; box-shadow: 0 4px 12px rgba(255, 107, 53, 0.25);">
                  Verify Account Node
                </a>
              </div>
              
              <div style="border-t: 1px solid #F1F5F9; padding-top: 20px; margin-top: 24px;">
                <label style="font-family: monospace; font-size: 10px; font-weight: 700; color: #94A3B8; text-transform: uppercase; display: block; margin-bottom: 6px;">Fallback Parameters URL</label>
                <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; padding: 10px 14px; border-radius: 8px; word-break: break-all; font-family: monospace; font-size: 11px; color: #475569;">
                  ${verifyUrl}
                </div>
              </div>
            </div>
          </div>
        </div>
      `,
    });

    this.logger.log(`Verification email sent to ${email}`);
  }

  async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    const resetUrl = `${this.configService.get<string>('APP_URL')}/api/auth/reset-password?token=${token}`;

    await this.transporter.sendMail({
      from: `"Sunday Workspace" <${this.configService.get<string>('EMAIL_USER')}>`,
      to: email,
      subject: 'Reset your Sunday Account Security Key',
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F4F6F8; padding: 40px 20px; text-align: left;">
          <div style="max-width: 520px; margin: 0 auto; background-color: #ffffff; border-radius: 20px; border: 1px solid #E2E8F0; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.02);">
            <div style="background-color: #161B24; padding: 24px 32px; border-bottom: 2px solid #FF6B35;">
              <div style="display: inline-block; width: 32px; height: 32px; background-color: #FF6B35; border-radius: 8px; vertical-align: middle; margin-right: 12px;"></div>
              <span style="color: #ffffff; font-weight: 700; font-size: 14px; letter-spacing: 1.5px; font-family: monospace; vertical-align: middle; text-transform: uppercase;">SUNDAY SYSTEM SECURITY</span>
            </div>
            
            <div style="padding: 36px 32px;">
              <h2 style="color: #0F131A; font-size: 20px; font-weight: 700; margin-top: 0; margin-bottom: 12px; letter-spacing: -0.5px;">Reset your password parameters</h2>
              <p style="color: #64748B; font-size: 13px; line-height: 1.6; margin-bottom: 28px;">
                A profile key override was requested for your account workspace. Click the button below to assign a new secure credential. This link remains valid for exactly 1 hour.
              </p>
              
              <div style="margin-bottom: 32px; text-align: center;">
                <a href="${resetUrl}"
                   style="display: inline-block; padding: 14px 28px; background-color: #FF6B35; color: #ffffff; border-radius: 12px; text-decoration: none; font-size: 12px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase; box-shadow: 0 4px 12px rgba(255, 107, 53, 0.25);">
                  Reset Security Key
                </a>
              </div>
              
              <p style="color: #94A3B8; font-size: 12px; margin-top: 24px; font-style: italic;">
                If you did not issue this adjustment sequence, you can safely ignore this document; your security context will remain untouched.
              </p>
            </div>
          </div>
        </div>
      `,
    });

    this.logger.log(`Password reset email sent to ${email}`);
  }
}