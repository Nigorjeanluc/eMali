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
