import { Module } from '@nestjs/common';
import { WelcomeController } from './welcome/welcome.controller';
import { TranslationModule } from './i18n/translation.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { RedisModule } from '@nestjs-modules/ioredis';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    RedisModule.forRootAsync({
      useFactory: () => ({
        type: 'single',
        options: {
          host: process.env.REDIS_HOST || 'localhost',
          port: parseInt(process.env.REDIS_PORT, 10) || 6379,
        },
      }),
    }),
    TranslationModule,
    AuthModule,
  ],
  controllers: [WelcomeController],
})
export class AppModule {}
