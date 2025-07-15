import { Test, TestingModule } from '@nestjs/testing';
import { TranslationModule } from './translation.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { I18nService } from 'nestjs-i18n';

describe('TranslationModule', () => {
  let module: TestingModule;
  let i18nService: I18nService;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [
            () => ({
              FALLBACK_LANGUAGE: 'en',
            }),
          ],
        }),
        TranslationModule,
      ],
    }).compile();

    i18nService = module.get<I18nService>(I18nService);
  });

  it('should compile and inject I18nService', () => {
    expect(i18nService).toBeDefined();
  });

  it('should return fallback language from ConfigService', () => {
    const configService = module.get<ConfigService>(ConfigService);
    expect(configService.get('FALLBACK_LANGUAGE')).toBe('en');
  });
});
