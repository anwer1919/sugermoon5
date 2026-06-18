import {
  Injectable, UnauthorizedException, BadRequestException, ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as argon2 from 'argon2';
import { nanoid } from 'nanoid';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
    private notify: NotificationsService,
  ) {}

  async register(dto: RegisterDto) {
    const exists = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (exists) throw new ConflictException('Email already registered');

    const hash = await argon2.hash(dto.password);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash: hash,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
        otpCode: await argon2.hash(otp),
        otpExpiresAt: new Date(Date.now() + 10 * 60_000),
      },
    });

    await this.notify.sendEmail(user.email, 'Verify your SugerMoon account',
      `Your verification code is: ${otp}`);

    return { message: 'Verification code sent to email' };
  }

  async verifyEmail(email: string, code: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedException();
    if (!user.otpCode || !user.otpExpiresAt || user.otpExpiresAt < new Date())
      throw new BadRequestException('Code expired');
    const valid = await argon2.verify(user.otpCode, code);
    if (!valid) throw new BadRequestException('Invalid code');

    await this.prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true, otpCode: null, otpExpiresAt: null },
    });
    return { message: 'Email verified' };
  }

  async login(dto: LoginDto, ip?: string, ua?: string) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user || !user.isActive) throw new UnauthorizedException('Invalid credentials');

    const ok = await argon2.verify(user.passwordHash, dto.password);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    if (!user.emailVerified) throw new UnauthorizedException('Email not verified');

    return this.issueTokens(user.id, ip, ua);
  }

  async refresh(refreshToken: string) {
    const session = await this.prisma.session.findUnique({ where: { refreshToken } });
    if (!session || session.expiresAt < new Date()) {
      if (session) await this.prisma.session.delete({ where: { id: session.id } });
      throw new UnauthorizedException();
    }
    await this.prisma.session.delete({ where: { id: session.id } });
    return this.issueTokens(session.userId);
  }

  async logout(refreshToken: string) {
    await this.prisma.session.deleteMany({ where: { refreshToken } });
  }

  private async issueTokens(userId: string, ip?: string, ua?: string) {
    const payload = { sub: userId };
    const accessToken = this.jwt.sign(payload, { expiresIn: '15m' });
    const refreshToken = nanoid(48);

    await this.prisma.session.create({
      data: {
        userId,
        refreshToken: await argon2.hash(refreshToken),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60_000),
        ipAddress: ip, userAgent: ua,
      },
    });

    await this.prisma.user.update({
      where: { id: userId }, data: { lastLoginAt: new Date() },
    });

    return { accessToken, refreshToken };
  }
}
