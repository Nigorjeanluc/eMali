// auth.service.spec.ts
import { Test } from '@nestjs/testing';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { AuthService } from './auth.service';
import { UsersService } from '../../users/services/users.service';
import { OtpService } from './otp.service';
import { comparePasswords } from '../../utils/bcrypt';

/* ─────────────── Stubs & mocks ─────────────── */
const mockUser = {
  id: 'uuid-123',
  email: 'alice@example.com',
  phone: '+250788123456',
  username: 'alice',
  name: 'Alice Doe',
  password: 'hashed',
  isActive: true,
  isVerified: true,
  role: 'CLIENT',
};

const mockToken = 'signed.jwt.token';

const mockUsersService = {
  createUser: jest.fn().mockResolvedValue(mockUser),
  findFirst: jest.fn().mockResolvedValue(null),
  findByLoginIdentifier: jest.fn().mockResolvedValue(mockUser),
  update: jest.fn(),
};

const mockOtpService = {
  generateAndStoreOtp: jest.fn().mockResolvedValue(true),
};

const mockJwtService = {
  sign: jest.fn().mockReturnValue(mockToken),
};

/* Mock helpers */
jest.mock('../../utils/bcrypt', () => ({
  comparePasswords: jest.fn(() => true),
}));
jest.mock('../../utils/usernameGenerator', () => ({
  usernameGenerator: jest.fn(() => 'generatedUser'),
}));

/* ───────────────────── Tests ───────────────────── */
describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: OtpService, useValue: mockOtpService },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signup', () => {
    it('registers a user and returns token + user', async () => {
      const dto = {
        email: mockUser.email,
        phone: mockUser.phone,
        name: mockUser.name,
        password: 'Password123',
      };

      const result = await service.signup(dto as any);

      expect(mockOtpService.generateAndStoreOtp).toHaveBeenCalledWith(
        mockUser.email,
        mockUser.name,
      );
      expect(mockUsersService.createUser).toHaveBeenCalled();
      expect(mockJwtService.sign).toHaveBeenCalled();

      expect(result).toEqual({
        accessToken: mockToken, // ← nested token object
        user: expect.objectContaining({
          id: mockUser.id,
          email: mockUser.email,
        }),
      });
    });

    it('throws BadRequestException if OTP fails', async () => {
      mockOtpService.generateAndStoreOtp.mockResolvedValueOnce(false);

      await expect(
        service.signup({
          email: mockUser.email,
          phone: mockUser.phone,
          name: mockUser.name,
          password: 'Password123',
        } as any),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('login', () => {
    it('returns token + user on success', async () => {
      const result = await service.login(mockUser.email, 'Password123');

      expect(result).toEqual({
        accessToken: mockToken, // ← nested token object
        user: expect.objectContaining({
          id: mockUser.id,
          email: mockUser.email,
        }),
      });
    });

    it('throws UnauthorizedException on bad password', async () => {
      (comparePasswords as jest.Mock).mockReturnValueOnce(false);

      await expect(service.login(mockUser.email, 'wrong')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('AuthService - verifyOtp', () => {
    let service: AuthService;
    let otpServiceMock: { verifyOtp: jest.Mock };
    let usersServiceMock: { update: jest.Mock };

    beforeEach(() => {
      otpServiceMock = {
        verifyOtp: jest.fn(),
      };

      usersServiceMock = {
        update: jest.fn(),
      };

      service = new AuthService(
        usersServiceMock as any,
        {} as any, // jwt service (not used in this test)
        otpServiceMock as any,
      );
    });

    it('should return true when OTP is valid', async () => {
      otpServiceMock.verifyOtp.mockResolvedValue(true);
      usersServiceMock.update.mockResolvedValue(true); // mock the DB update

      await expect(
        service.verifyOtp('user@example.com', '123456'),
      ).resolves.toBe(true);

      expect(otpServiceMock.verifyOtp).toHaveBeenCalledWith(
        'user@example.com',
        '123456',
      );
      expect(usersServiceMock.update).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when OTP is invalid', async () => {
      otpServiceMock.verifyOtp.mockResolvedValue(false);

      await expect(
        service.verifyOtp('user@example.com', 'wrongotp'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});

describe('AuthService - refreshOtp', () => {
  let service: AuthService;
  let otpServiceMock: { generateAndStoreOtp: jest.Mock };
  let usersServiceMock: { findByLoginIdentifier: jest.Mock };

  beforeEach(() => {
    otpServiceMock = {
      generateAndStoreOtp: jest.fn(),
    };

    usersServiceMock = {
      findByLoginIdentifier: jest.fn(),
    };

    service = new AuthService(
      usersServiceMock as any,
      {} as any, // jwt service (not used in this test)
      otpServiceMock as any,
    );
  });

  it('should return true when OTP is refreshed', async () => {
    usersServiceMock.findByLoginIdentifier.mockResolvedValue({
      email: 'user@example.com',
      name: 'User',
    });
    otpServiceMock.generateAndStoreOtp.mockResolvedValue(true);

    await expect(service.refreshOtp('user@example.com')).resolves.toBe(true);

    expect(otpServiceMock.generateAndStoreOtp).toHaveBeenCalledWith(
      'user@example.com',
      'User',
    );
  });

  it('should throw BadRequestException when user is not found', async () => {
    usersServiceMock.findByLoginIdentifier.mockResolvedValue(null);

    await expect(service.refreshOtp('user@example.com')).rejects.toThrow(
      BadRequestException,
    );
  });
});

describe('AuthService – logout', () => {
  it('simply resolves true for now', async () => {
    const service = new AuthService({} as any, {} as any, {} as any);

    await expect(service.logout('abc.def.ghi')).resolves.toBe(true);
  });
});
