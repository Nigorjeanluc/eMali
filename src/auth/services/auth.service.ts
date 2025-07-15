import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Prisma } from '@prisma/client';
import { UsersService } from '../../users/services/users.service';
import { CreateUserDto } from '../dtos/auth.dto';
import { OtpService } from './otp.service';
import { comparePasswords } from '../../utils/bcrypt';
import { usernameGenerator } from '../../utils/usernameGenerator';

type UserWithRole = Prisma.UserGetPayload<{
  select: {
    id: true;
    email: true;
    phone: true;
    username: true;
    name: true;
    password: true;
    isActive: true;
    isVerified: true;
    role: true;
  };
}>;

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwt: JwtService,
    private readonly otpService: OtpService,
  ) {}

  /* -----------------------  REGISTRATION  ----------------------- */
  async signup(userDto: CreateUserDto) {
    const { email, phone, username, password, role, ...rest } = userDto;

    const isEmailSent = await this.otpService.generateAndStoreOtp(
      email,
      userDto.name,
    );
    if (!isEmailSent) {
      throw new BadRequestException(
        'Failed to send OTP. Please try again later.',
      );
    }

    await this.ensureUnique(email, phone, username);

    const user = await this.usersService.createUser({
      email: email.toLowerCase(),
      phone,
      username: username || usernameGenerator(userDto.name),
      name: userDto.name,
      password: await bcrypt.hash(password, 10),
      role,
      ...rest,
    });

    const {
      id,
      email: userEmail,
      phone: userPhone,
      username: userUsername,
      name,
      isActive,
      isVerified,
    } = user;

    return {
      accessToken: this.buildTokens({
        id,
        email: userEmail,
        phone: userPhone,
        username: userUsername,
        name,
        isActive,
        isVerified,
      } as UserWithRole),
      user: {
        id,
        email: userEmail,
        phone: userPhone,
        username: userUsername,
        name,
        isActive,
        isVerified,
      } as UserWithRole,
    };
  }

  /* ---------------------------  LOGIN  --------------------------- */
  async login(identifier: string, password: string) {
    const user = await this.usersService.findByLoginIdentifier(identifier);

    if (
      !user ||
      !comparePasswords(password, user.password) ||
      !user.isActive ||
      !user.isVerified
    ) {
      throw new UnauthorizedException('Invalid credentials');
    }

    await this.usersService.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    return {
      accessToken: this.buildTokens({
        id: user.id,
        email: user.email,
        phone: user.phone,
        username: user.username,
        name: user.name,
        isActive: user.isActive,
        isVerified: user.isVerified,
      } as UserWithRole),
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        username: user.username,
        name: user.name,
        isActive: user.isActive,
        isVerified: user.isVerified,
      } as UserWithRole,
    };
  }

  /* -------------------------  OTP VERIFICATION  ------------------------- */
  async verifyOtp(identifier: string, otp: string): Promise<boolean> {
    const isValid = await this.otpService.verifyOtp(identifier, otp);

    if (!isValid) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    if (isValid) {
      await this.usersService.update({
        where: { email: identifier },
        data: { isVerified: true },
      });
    }

    return true;
  }

  /* -------------------------  RESEND OTP  --------------------------- */
  async refreshOtp(email: string): Promise<boolean> {
    const user = await this.usersService.findByLoginIdentifier(email);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    const isEmailSent = await this.otpService.generateAndStoreOtp(
      email,
      user.name,
    );

    if (!isEmailSent) {
      throw new BadRequestException('Failed to send OTP. Try again later.');
    }

    return true;
  }

  /* -------------------------  LOGOUT  --------------------------- */
  /** Add access‑token to a server‑side blacklist (or similar). */
  async logout(rawJwt: string): Promise<boolean> {
    // TODO: blacklist in Redis or increment tokenVersion in DB
    console.log(`Logging out token: ${rawJwt.slice(0, 10)}…`);
    return true;
  }

  /* -------------------------  HELPERS  --------------------------- */
  private async ensureUnique(email: string, phone: string, username?: string) {
    const exists = await this.usersService.findFirst({
      where: {
        OR: [{ email }, { phone }, username ? { username } : undefined].filter(
          Boolean,
        ),
      },
    });
    if (exists) {
      throw new BadRequestException('Email, phone or username already in use');
    }
  }

  private buildTokens(user: UserWithRole) {
    const payload = {
      sub: user.id,
      email: user.email,
      phone: user.phone,
      username: user.username,
      name: user.name,
      isVerified: user.isVerified,
      isActive: user.isActive,
      role: user.role,
    };
    return this.jwt.sign(payload, { expiresIn: '12h' });
  }
}
