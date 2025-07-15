import { Injectable } from '@nestjs/common';
import AfricasTalking from 'africastalking';

@Injectable()
export class SMSService {
  private sms: any;

  constructor() {
    const africastalking = AfricasTalking({
      apiKey: process.env.AT_API_KEY,
      username: process.env.AT_USERNAME,
    });
    this.sms = africastalking.SMS;
  }

  async sendSMS(to: string, message: string, from?: string) {
    try {
      const response = await this.sms.send({
        to,
        message,
        from,
      });
      return response;
    } catch (error) {
      console.error('SMS sending failed:', error);
      throw error;
    }
  }
}
