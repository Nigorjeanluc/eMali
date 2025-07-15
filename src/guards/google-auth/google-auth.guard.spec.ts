// google-auth.guard.spec.ts
import { UnauthorizedException } from '@nestjs/common';
import { GoogleAuthGuard } from './google-auth.guard';
import { OAuth2Client } from 'google-auth-library';

process.env.GOOGLE_CLIENT_ID = 'test-client-id';

type Awaited<T> = T extends Promise<infer U> ? U : T;
type VerifyReturn = Awaited<ReturnType<OAuth2Client['verifyIdToken']>>;

interface UserPayload {
  email: string;
  name: string;
  picture: string;
}
interface ReqWithUser {
  body: { accessToken?: string };
  user?: UserPayload;
}

const ctx = (token?: string) => {
  const req: ReqWithUser = { body: token ? { accessToken: token } : {} };
  return { switchToHttp: () => ({ getRequest: () => req }) };
};

describe('GoogleAuthGuard', () => {
  let guard: GoogleAuthGuard;

  beforeEach(() => {
    guard = new GoogleAuthGuard();
    jest.restoreAllMocks();
  });

  it('rejects when token is missing', async () => {
    await expect(guard.canActivate(ctx())).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('accepts a valid token', async () => {
    const payload: UserPayload = { email: 'a@b.c', name: 'User', picture: 'p' };
    const ticket: VerifyReturn = {
      getPayload: () => payload,
    } as unknown as VerifyReturn;

    const verify = jest.spyOn(
      OAuth2Client.prototype as unknown as {
        verifyIdToken: (...a: any[]) => Promise<VerifyReturn>;
      },
      'verifyIdToken',
    ) as jest.MockedFunction<(o: any) => Promise<VerifyReturn>>;

    verify.mockResolvedValueOnce(ticket);

    const context = ctx('good');
    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(context.switchToHttp().getRequest().user).toEqual(payload);
  });

  it('rejects an invalid token', async () => {
    const verify = jest.spyOn(
      OAuth2Client.prototype as unknown as {
        verifyIdToken: (...a: any[]) => Promise<VerifyReturn>;
      },
      'verifyIdToken',
    ) as jest.MockedFunction<(o: any) => Promise<VerifyReturn>>;

    verify.mockRejectedValueOnce(new Error('bad') as never);

    await expect(guard.canActivate(ctx('bad'))).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });
});
