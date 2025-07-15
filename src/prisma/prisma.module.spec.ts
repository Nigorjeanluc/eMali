import { Test, TestingModule } from '@nestjs/testing';
import { PrismaModule } from './prisma.module';
import { PrismaService } from './services/prisma.service';

describe('PrismaModule', () => {
  let module: TestingModule;
  let prisma: PrismaService;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [PrismaModule],
    }).compile();

    prisma = module.get<PrismaService>(PrismaService);
  });

  it('compiles and provides PrismaService', () => {
    expect(prisma).toBeDefined();
    expect(typeof prisma.$connect).toBe('function');
  });

  it('exports PrismaService for other modules', async () => {
    const another = await Test.createTestingModule({
      imports: [PrismaModule],
    }).compile();

    const exported = another.get<PrismaService>(PrismaService);
    expect(exported).toBeDefined();
    expect(typeof exported.$connect).toBe('function');
  });
});
