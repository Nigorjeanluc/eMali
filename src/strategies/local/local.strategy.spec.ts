import { UnauthorizedException } from '@nestjs/common';
import { LocalStrategy } from './local.strategy';

describe('LocalStrategy', () => {
  let strategy: LocalStrategy;
  let authServiceMock: { login: jest.Mock };

  beforeEach(() => {
    authServiceMock = {
      login: jest.fn(),
    };

    strategy = new LocalStrategy(authServiceMock as any);
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should return user when login is successful', async () => {
    const user = { id: 1, username: 'testuser' };
    authServiceMock.login.mockResolvedValue({ accessToken: 'token', user });

    const result = await strategy.validate('identifier', 'password');

    expect(console.log).toHaveBeenCalledWith('Inside LocalStrategy');
    expect(authServiceMock.login).toHaveBeenCalledWith(
      'identifier',
      'password',
    );
    expect(result).toEqual(user);
  });

  it('should throw UnauthorizedException when no user returned', async () => {
    authServiceMock.login.mockResolvedValue({
      accessToken: 'token',
      user: null,
    });

    await expect(strategy.validate('identifier', 'password')).rejects.toThrow(
      UnauthorizedException,
    );

    expect(console.log).toHaveBeenCalledWith('Inside LocalStrategy');
    expect(authServiceMock.login).toHaveBeenCalledWith(
      'identifier',
      'password',
    );
  });
});
