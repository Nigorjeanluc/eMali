import { Module } from '@nestjs/common';
import { WelcomeController } from './welcome/welcome.controller';
import { TranslationModule } from './i18n/translation.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TranslationModule,
  ],
  controllers: [WelcomeController],
})
export class AppModule {}
