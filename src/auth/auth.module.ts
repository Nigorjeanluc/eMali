import { Module } from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { AuthController } from './controllers/auth.controller';
import { OtpService } from './services/otp.service';
// import { SMSModule } from 'src/sms/sms.module';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { EmailModule } from '../email/email.module';
import { PassportModule } from '@nestjs/passport';
import { JWTStrategy } from '../strategies/jwt/jwt.strategy';

@Module({
  imports: [
    PassportModule,
    // SMSModule,
    EmailModule,
    UsersModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'secret123',
      signOptions: { expiresIn: '12h' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, OtpService, JWTStrategy],
})
export class AuthModule {}
