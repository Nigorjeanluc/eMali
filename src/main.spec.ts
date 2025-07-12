/* eslint-disable @typescript-eslint/no-require-imports */
// main.spec.ts
import { join } from 'path';
import { AppModule } from './app.module';

jest.mock('@nestjs/core', () => ({
  NestFactory: {
    create: jest.fn(),
  },
}));

jest.mock('@nestjs/swagger', () => ({
  SwaggerModule: {
    createDocument: jest.fn(),
    setup: jest.fn(),
  },
}));

jest.mock('@nestjs/swagger', () => {
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
    SwaggerModule: {
      createDocument: jest.fn(),
      setup: jest.fn(),
    },
    DocumentBuilder, // <-- export the class here
  };
});

describe('bootstrap', () => {
  let appMock: any;
  let NestFactory: any;
  let SwaggerModule: any;

  beforeEach(() => {
    // Import mocks inside to get updated jest mocks
    NestFactory = require('@nestjs/core').NestFactory;
    SwaggerModule = require('@nestjs/swagger').SwaggerModule;

    appMock = {
      setGlobalPrefix: jest.fn(),
      useStaticAssets: jest.fn(),
      setBaseViewsDir: jest.fn(),
      listen: jest.fn().mockResolvedValue(undefined),
    };

    NestFactory.create.mockResolvedValue(appMock);
    SwaggerModule.createDocument.mockReturnValue({});
    SwaggerModule.setup.mockImplementation(() => {});
  });

  it('should bootstrap the app with proper setup', async () => {
    // Import bootstrap dynamically so mocks apply
    const { bootstrap } = await import('./main');

    await bootstrap();

    expect(NestFactory.create).toHaveBeenCalledWith(AppModule);

    expect(appMock.setGlobalPrefix).toHaveBeenCalledWith('api/v1');
    expect(appMock.useStaticAssets).toHaveBeenCalledWith(
      join(process.cwd(), 'public'),
    );
    expect(appMock.setBaseViewsDir).toHaveBeenCalledWith(
      join(process.cwd(), 'api/v1/public'),
    );
    expect(SwaggerModule.createDocument).toHaveBeenCalledWith(
      appMock,
      expect.any(Object),
    );
    expect(SwaggerModule.setup).toHaveBeenCalledWith('api-docs', appMock, {});
    expect(appMock.listen).toHaveBeenCalledWith(3000);
  });
});
