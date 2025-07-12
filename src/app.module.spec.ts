import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from './app.module';
import { WelcomeController } from './welcome/welcome.controller';
import { I18nService } from 'nestjs-i18n';
import { ConfigService } from '@nestjs/config';

describe('AppModule', () => {
  let module: TestingModule;

  beforeAll(async () => {
    process.env.FALLBACK_LANGUAGE = 'en'; // ensure required env var exists

    module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
  });

  it('should compile the AppModule', () => {
    expect(module).toBeDefined();
  });

  it('should have WelcomeController defined', () => {
    const controller = module.get<WelcomeController>(WelcomeController);
    expect(controller).toBeDefined();
  });

  it('should inject I18nService and ConfigService', () => {
    const i18n = module.get<I18nService>(I18nService);
    const config = module.get<ConfigService>(ConfigService);

    expect(i18n).toBeDefined();
    expect(config.get('FALLBACK_LANGUAGE')).toBe('en');
  });
});
