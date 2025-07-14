import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from '../services/auth.service';
import { HttpStatus } from '@nestjs/common';

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
