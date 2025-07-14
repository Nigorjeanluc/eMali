/* ─── mock @prisma/client BEFORE importing PrismaService ─── */
let mockConnect: jest.Mock;
let mockDisconnect: jest.Mock;

jest.mock('@prisma/client', () => {
  mockConnect = jest.fn();
  mockDisconnect = jest.fn();

  class MockPrismaClient {
    $connect = mockConnect;
    $disconnect = mockDisconnect;
  }

  return { PrismaClient: MockPrismaClient };
});

/* ─── now import the service that extends PrismaClient ─── */
import { PrismaService } from './prisma.service';

/* helper to flush micro‑task queue */
const flushPromises = () => new Promise(process.nextTick);

describe('PrismaService', () => {
  let service: PrismaService;
  const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

  beforeEach(() => {
    jest.clearAllMocks();
    service = new PrismaService();
  });

  it('logs “Connected to database” when $connect resolves', async () => {
    mockConnect.mockResolvedValueOnce(undefined);

    await service.onModuleInit();
    await flushPromises();

    expect(mockConnect).toHaveBeenCalledTimes(1);
    expect(consoleSpy).toHaveBeenCalledWith('Connected to database');
  });

  it('logs the error when $connect rejects', async () => {
    const err = new Error('boom');
    mockConnect.mockRejectedValueOnce(err);

    await service.onModuleInit();
    await flushPromises();

    expect(mockConnect).toHaveBeenCalledTimes(1);
    expect(consoleSpy).toHaveBeenCalledWith(
      'Error connecting to database',
      err,
    );
  });
});
