// jwt-auth.guard.spec.ts
import { ExecutionContext } from '@nestjs/common';
import { JWTAuthGuard } from './jwt.guard';

type Ctx = ExecutionContext;

const mockContext: Ctx = {
  switchToHttp: () => ({ getRequest: () => ({}) }),
  switchToRpc: () => ({}) as any,
  switchToWs: () => ({}) as any,
  getType: () => 'http' as any,
  getHandler: () => ({}) as any,
  getClass: () => ({}) as any,
  getArgs: () => [],
  getArgByIndex: () => null,
} as unknown as Ctx;

describe('JWTAuthGuard', () => {
  let guard: JWTAuthGuard;
  let baseProto: any;

  beforeEach(() => {
    guard = new JWTAuthGuard();
    baseProto = Object.getPrototypeOf(Object.getPrototypeOf(guard));
    jest.restoreAllMocks();
  });

  it('returns true when base guard allows', () => {
    jest.spyOn(baseProto, 'canActivate').mockReturnValue(true);
    const result = guard.canActivate(mockContext);
    expect(result).toBe(true);
  });

  it('returns false when base guard denies', () => {
    jest.spyOn(baseProto, 'canActivate').mockReturnValue(false);
    const result = guard.canActivate(mockContext);
    expect(result).toBe(false);
  });

  // it('logs to console each call', () => {
  //   const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  //   jest.spyOn(baseProto, 'canActivate').mockReturnValue(true);

  //   guard.canActivate(mockContext);

  //   expect(logSpy).toHaveBeenCalledWith('Inside JWT AuthGuard canActivate');
  //   logSpy.mockRestore();
  // });
});
