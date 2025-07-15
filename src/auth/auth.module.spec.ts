// src/auth/auth.module.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';

import { AuthModule } from './auth.module';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { OtpService } from './services/otp.service';
import { UsersService } from '../users/services/users.service';
import { EmailService } from '../email/services/email.service';
import { JWTStrategy } from '../strategies/jwt/jwt.strategy';

/* ─────────── stub collaborators ─────────── */
const usersServiceMock = {};
const emailServiceMock = {};
const jwtServiceMock = { sign: jest.fn() };
const otpServiceMock = {};
const jwtStrategyMock = {}; // we don’t need real Passport logic

describe('AuthModule', () => {
  let module: TestingModule;
  let authController: AuthController;
  let authService: AuthService;
  let otpService: OtpService;
  let jwtStrategy: JWTStrategy;

  beforeAll(async () => {
    module = await Test.createTestingModule({ imports: [AuthModule] })
      /* override external providers coming from imported modules */
      .overrideProvider(UsersService)
      .useValue(usersServiceMock)
      .overrideProvider(EmailService)
      .useValue(emailServiceMock)
      .overrideProvider(JwtService)
      .useValue(jwtServiceMock)
      /* override providers declared directly in AuthModule */
      .overrideProvider(OtpService)
      .useValue(otpServiceMock)
      .overrideProvider(JWTStrategy)
      .useValue(jwtStrategyMock)
      .compile();

    authController = module.get(AuthController);
    authService = module.get(AuthService);
    otpService = module.get(OtpService);
    jwtStrategy = module.get(JWTStrategy);
  });

  it('compiles AuthModule and injects controller / services / strategy', () => {
    expect(authController).toBeDefined();
    expect(authService).toBeDefined();
    expect(otpService).toBeDefined();
    expect(jwtStrategy).toBeDefined();
  });
});
