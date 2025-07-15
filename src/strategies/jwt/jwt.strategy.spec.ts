// jwt.strategy.spec.ts
import { ExtractJwt } from 'passport-jwt';
import { JWTStrategy } from './jwt.strategy';

describe('JWTStrategy', () => {
  const TEST_SECRET = 'test-secret';

  beforeEach(() => {
    process.env.JWT_SECRET = TEST_SECRET;
    jest.restoreAllMocks();
  });

  it('should be instantiated without errors', () => {
    const strategy = new JWTStrategy();
    expect(strategy).toBeInstanceOf(JWTStrategy);
  });

  it('validate() returns the payload and logs', () => {
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    const payload = { sub: '123', email: 'user@example.com' };
    const strategy = new JWTStrategy();

    const result = strategy.validate(payload);

    expect(result).toBe(payload);
    expect(logSpy).toHaveBeenCalledWith('Inside JWT Strategy Validate');
    logSpy.mockRestore();
  });

  it('extractor pulls token from Bearer header', () => {
    const token = 'abc.def.ghi';
    const req = { headers: { authorization: `Bearer ${token}` } };
    const extractor = ExtractJwt.fromAuthHeaderAsBearerToken();

    expect(extractor(req as any)).toBe(token);
  });
});
