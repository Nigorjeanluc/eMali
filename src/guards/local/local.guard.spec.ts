// local.guard.spec.ts
import { ExecutionContext } from '@nestjs/common';
import { LocalGuard } from './local.guard';

/* ---------- light‑weight ExecutionContext mock ---------- */
type Ctx = ExecutionContext;
const mockCtx: Ctx = {
  switchToHttp: () => ({ getRequest: () => ({}) }),
  switchToRpc: () => ({}) as any,
  switchToWs: () => ({}) as any,
  getType: () => 'http' as any,
  getHandler: () => ({}) as any,
  getClass: () => ({}) as any,
  getArgs: () => [],
  getArgByIndex: () => null,
} as unknown as Ctx;
/* -------------------------------------------------------- */

describe('LocalGuard', () => {
  let guard: LocalGuard;
  // prototype returned by AuthGuard('local')
  let baseProto: any;

  beforeEach(() => {
    guard = new LocalGuard();
    // LocalGuard → BaseAuthGuard → Object
    baseProto = Object.getPrototypeOf(Object.getPrototypeOf(guard));
    jest.restoreAllMocks();
  });

  it('returns true when base guard allows (sync)', () => {
    jest.spyOn(baseProto, 'canActivate').mockReturnValue(true);
    expect(guard.canActivate(mockCtx)).toBe(true);
  });

  it('returns true when base guard resolves (async)', async () => {
    jest
      .spyOn(baseProto, 'canActivate')
      .mockReturnValue(Promise.resolve(true) as any);

    await expect(guard.canActivate(mockCtx)).resolves.toBe(true);
  });

  it('returns false when base guard denies', () => {
    jest.spyOn(baseProto, 'canActivate').mockReturnValue(false);
    expect(guard.canActivate(mockCtx)).toBe(false);
  });

  // it('logs to console each call', () => {
  //   const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  //   jest.spyOn(baseProto, 'canActivate').mockReturnValue(true);

  //   guard.canActivate(mockCtx);

  //   expect(logSpy).toHaveBeenCalledWith('Inside LocalGuard');
  //   logSpy.mockRestore();
  // });
});
