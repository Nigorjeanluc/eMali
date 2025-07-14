import { Test, TestingModule } from '@nestjs/testing';
import { AuthModule } from './auth.module';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { OtpService } from './services/otp.service';
import { UsersService } from '../users/services/users.service';
import { EmailService } from '../email/services/email.service';
import { JwtService } from '@nestjs/jwt';

/* ─────────── collaborators we’ll stub ─────────── */
const usersServiceMock = {};
const emailServiceMock = {};
const jwtServiceMock = { sign: jest.fn() };
const otpServiceMock = {}; // no Redis dependency needed

describe('AuthModule', () => {
  let module: TestingModule;
  let authController: AuthController;
  let authService: AuthService;
  let otpService: OtpService;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [AuthModule],
    })
      .overrideProvider(UsersService)
      .useValue(usersServiceMock)
      .overrideProvider(EmailService)
      .useValue(emailServiceMock)
      .overrideProvider(JwtService)
      .useValue(jwtServiceMock)
      .overrideProvider(OtpService) // ← mock OtpService itself
      .useValue(otpServiceMock)
      .compile();

    authController = module.get(AuthController);
    authService = module.get(AuthService);
    otpService = module.get(OtpService);
  });

  it('compiles AuthModule and injects controller/service', () => {
    expect(authController).toBeDefined();
    expect(authService).toBeDefined();
    expect(otpService).toBeDefined();
  });
});
