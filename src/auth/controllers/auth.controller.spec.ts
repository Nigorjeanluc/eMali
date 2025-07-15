import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from '../services/auth.service';
import { HttpStatus, UnauthorizedException } from '@nestjs/common';

describe('AuthController', () => {
  let controller: AuthController;

  /* ─────────── stubs ─────────── */
  const userStub = {
    id: '8c6b27c4-b1ed-4d30-b5e2-a1d80e99c9af',
    email: 'janedoe@example.com',
    phone: '+250788123456',
    username: 'janedoe',
    name: 'Jane Doe',
  };

  const tokenStub = 'eyJhbGciOiJIUzI1NiIsInR...';

  /* Mock AuthService implementation */
  const authServiceMock = {
    signup: jest.fn().mockResolvedValue({
      accessToken: tokenStub,
      user: userStub,
    }),
    login: jest.fn().mockResolvedValue({
      accessToken: tokenStub,
      user: userStub,
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authServiceMock }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('signup', () => {
    it('returns 201 JSON envelope', async () => {
      /* fake dto */
      const createUserDto: any = {
        email: 'janedoe@example.com',
        phone: '+250788123456',
        name: 'Jane Doe',
        password: 'StrongPass1',
      };

      /* mock Express Response */
      const res: any = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await controller.signup(createUserDto, {} as any, res);

      expect(authServiceMock.signup).toHaveBeenCalledWith(createUserDto);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.CREATED);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'User successfully registered',
        data: {
          accessToken: tokenStub,
          user: userStub,
        },
      });
    });
  });

  describe('login', () => {
    it('returns 200 JSON envelope', async () => {
      const loginDto: any = {
        identifier: 'janedoe@example.com',
        password: 'StrongPass1',
      };

      const res: any = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await controller.login(loginDto, {} as any, res);

      expect(authServiceMock.login).toHaveBeenCalledWith(
        loginDto.identifier,
        loginDto.password,
      );
      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'User logged in successfully',
        data: {
          accessToken: tokenStub,
          user: userStub,
        },
      });
    });
  });
});

describe('AuthController – verify‑otp', () => {
  let controller: AuthController;
  const authServiceMock = { verifyOtp: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authServiceMock }],
    }).compile();

    controller = module.get(AuthController);
    jest.resetAllMocks();
  });

  it('returns { success: true } on valid OTP', async () => {
    authServiceMock.verifyOtp.mockResolvedValue(true);
    const req = { user: { email: 'user@example.com' } } as any;

    const res = await controller.verifyOtp({ otp: '123456' }, req);

    expect(res).toEqual({ success: true });
    expect(authServiceMock.verifyOtp).toHaveBeenCalledWith(
      'user@example.com',
      '123456',
    );
  });

  it('propagates UnauthorizedException on invalid OTP', async () => {
    authServiceMock.verifyOtp.mockRejectedValue(
      new UnauthorizedException('Invalid OTP'),
    );
    const req = { user: { email: 'user@example.com' } } as any;

    await expect(
      controller.verifyOtp({ otp: '000000' }, req),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});

describe('AuthController – refreshOtp', () => {
  it('calls authService.refreshOtp with email from token', async () => {
    const authServiceMock = {
      refreshOtp: jest.fn().mockResolvedValue(true),
    };

    const module = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authServiceMock }],
    }).compile();

    const controller = module.get(AuthController);
    const req = { user: { email: 'test@example.com' } } as any;

    const res = await controller.refreshOtp(req);
    expect(res).toEqual({ success: true });
    expect(authServiceMock.refreshOtp).toHaveBeenCalledWith('test@example.com');
  });
});

describe('AuthController – logout', () => {
  const authServiceMock = { logout: jest.fn() };

  let controller: AuthController;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authServiceMock }],
    }).compile();

    controller = module.get(AuthController);
    jest.clearAllMocks();
  });

  it('calls AuthService.logout with token from Authorization header', async () => {
    authServiceMock.logout.mockResolvedValue(true);
    const req = {
      headers: { authorization: 'Bearer abc.def.ghi' },
    } as any;

    const res = await controller.logout(req);

    expect(res).toEqual({ success: true });
    expect(authServiceMock.logout).toHaveBeenCalledWith('abc.def.ghi');
  });

  it('handles missing “Bearer” prefix gracefully', async () => {
    authServiceMock.logout.mockResolvedValue(true);
    const req = { headers: { authorization: 'abc.def.ghi' } } as any;

    await controller.logout(req);

    expect(authServiceMock.logout).toHaveBeenCalledWith('abc.def.ghi');
  });
});
