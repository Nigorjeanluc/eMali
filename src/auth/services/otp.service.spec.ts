import { Test } from '@nestjs/testing';
import { OtpService } from './otp.service';
import { EmailService } from '../../email/services/email.service';

/* ───── shared mocks ───── */
const redisMock = {
  set: jest.fn(),
  get: jest.fn(),
  del: jest.fn(),
};
const emailServiceMock = {
  sendVerificationEmail: jest.fn(),
};

describe('OtpService', () => {
  let otpService: OtpService;

  beforeEach(async () => {
    jest.resetAllMocks();

    const module = await Test.createTestingModule({
      providers: [
        OtpService,
        { provide: EmailService, useValue: emailServiceMock },
        {
          // This is the token created by @nestjs‑modules/ioredis
          provide: 'default_IORedisModuleConnectionToken',
          useValue: redisMock,
        },
      ],
    }).compile();

    otpService = module.get<OtpService>(OtpService);
  });

  it('should be defined', () => {
    expect(otpService).toBeDefined();
  });

  it('generateAndStoreOtp → sends email and stores OTP', async () => {
    redisMock.set.mockResolvedValue('OK');

    const otp = await otpService.generateAndStoreOtp(
      'alice@example.com',
      'Alice',
    );

    expect(emailServiceMock.sendVerificationEmail).toHaveBeenCalledWith(
      'alice@example.com',
      'Alice',
      otp,
    );
    expect(redisMock.set).toHaveBeenCalledWith(
      'otp:alice@example.com',
      otp,
      'EX',
      300,
    );
  });

  it('verifyOtp → returns true on match', async () => {
    redisMock.get.mockResolvedValue('654321');
    expect(await otpService.verifyOtp('alice@example.com', '654321')).toBe(
      true,
    );
  });

  it('deleteOtp → deletes key', async () => {
    await otpService.deleteOtp('alice@example.com');
    expect(redisMock.del).toHaveBeenCalledWith('otp:alice@example.com');
  });
});
