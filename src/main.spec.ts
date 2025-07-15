/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-require-imports */
import { join } from 'path';
import { AppModule } from './app.module';

/* ─────────── mocks ─────────── */
jest.mock('@nestjs/core', () => ({ NestFactory: { create: jest.fn() } }));

const basicAuthMock = jest.fn();
jest.mock('express-basic-auth', () => basicAuthMock);

jest.mock('@nestjs/swagger', () => {
  const noop = () => () => {};
  class DocumentBuilder {
    setTitle() {
      return this;
    }
    setDescription() {
      return this;
    }
    setVersion() {
      return this;
    }
    addBearerAuth() {
      return this;
    }
    build() {
      return {};
    }
  }
  return {
    /* no‑op decorators */
    ApiProperty: noop,
    ApiPropertyOptional: noop,
    ApiOperation: noop,
    ApiTags: noop,
    ApiBody: noop,
    ApiResponse: noop,
    /* swagger runtime helpers */
    SwaggerModule: {
      createDocument: jest.fn(),
      setup: jest.fn(),
    },
    DocumentBuilder,
  };
});

/* ─────────── tests ─────────── */
describe('bootstrap()', () => {
  let appMock: any;
  let NestFactory: any;
  let SwaggerModule: any;

  beforeEach(() => {
    jest.resetModules();

    NestFactory = require('@nestjs/core').NestFactory;
    SwaggerModule = require('@nestjs/swagger').SwaggerModule;

    appMock = {
      setGlobalPrefix: jest.fn(),
      useGlobalPipes: jest.fn(),
      useStaticAssets: jest.fn(),
      use: jest.fn(),
      listen: jest.fn().mockResolvedValue(undefined),
    };

    NestFactory.create.mockResolvedValue(appMock);
    SwaggerModule.createDocument.mockReturnValue({});
    basicAuthMock.mockReset();
  });

  afterEach(() => {
    delete process.env.NODE_ENV;
    delete process.env.SWAGGER_PWD;
  });

  it('bootstraps correctly when NODE_ENV is not production', async () => {
    process.env.NODE_ENV = 'test';

    const main = await import('./main');
    NestFactory.create.mockClear();
    await main.bootstrap();

    expect(NestFactory.create).toHaveBeenCalledTimes(1);
    /* Compare by class name (robust across module instances) */
    expect(NestFactory.create.mock.calls[0][0].name).toBe('AppModule');

    expect(appMock.setGlobalPrefix).toHaveBeenCalledWith('api/v1');
    expect(appMock.useStaticAssets).toHaveBeenCalledWith(
      join(process.cwd(), 'public'),
    );
    expect(SwaggerModule.createDocument).toHaveBeenCalledWith(
      appMock,
      expect.any(Object),
    );
    expect(SwaggerModule.setup).toHaveBeenCalledWith('api-docs', appMock, {});
    expect(appMock.listen).toHaveBeenCalledWith(3000);
    expect(appMock.use).not.toHaveBeenCalled();
  });

  it('adds basicAuth middleware when NODE_ENV=production', async () => {
    process.env.NODE_ENV = 'production';
    process.env.SWAGGER_PWD = 'admin';
    basicAuthMock.mockReturnValue('basicAuthMiddleware');

    const main = await import('./main');
    NestFactory.create.mockClear();
    await main.bootstrap();

    expect(basicAuthMock).toHaveBeenCalledWith({
      users: { admin: 'admin' },
      challenge: true,
    });
    expect(appMock.use).toHaveBeenCalledWith(
      ['/api-docs', '/api-docs-json'],
      'basicAuthMiddleware',
    );
  });
});
