import { Injectable } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { Redis } from 'ioredis';
import { EmailService } from '../../email/services/email.service';
// import { SMSService } from 'src/sms/services/sms.service';

@Injectable()
export class OtpService {
  constructor(
    @InjectRedis() private readonly redis: Redis,
    // private readonly africasTalkingService: SMSService,
    private readonly emailService: EmailService,
  ) {}

  async generateAndStoreOtp(email: string, name: string): Promise<string> {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    // Send OTP via SMS
    try {
      await this.emailService.sendVerificationEmail(email, name, otp);
    } catch (error) {
      console.error('Failed to send OTP via SMS:', error.message);
      throw new Error('Failed to send OTP. Please try again later.');
    }

    // Store OTP with 5 minutes expiration
    await this.redis.set(`otp:${email}`, otp, 'EX', 300);

    return otp;
  }

  async verifyOtp(email: string, otp: string): Promise<boolean> {
    const storedOtp = await this.redis.get(`otp:${email}`);
    return storedOtp === otp;
  }

  async deleteOtp(email: string) {
    await this.redis.del(`otp:${email}`);
  }
}
