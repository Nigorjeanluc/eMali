import { MailerService } from '@nestjs-modules/mailer';
import {
  Injectable,
  HttpException,
  HttpStatus,
  Logger,
  BadRequestException,
} from '@nestjs/common';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(private mailerService: MailerService) {}

  async sendVerificationEmail(
    email: string,
    name: any,
    otpCode: string,
  ): Promise<any> {
    try {
      // Validate inputs
      if (!email) {
        throw new BadRequestException('Email is required');
      }

      this.logger.log(`Sending verification email to: ${email}`);

      // HTML template with better styling
      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              .email-container {
                font-family: Arial, sans-serif;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f7f7f7;
                color: #333;
              }
              .otp-box {
                background-color: #4CAF50;
                color: white;
                font-size: 24px;
                font-weight: bold;
                padding: 12px 24px;
                display: inline-block;
                border-radius: 4px;
                letter-spacing: 4px;
                margin: 20px 0;
              }
              .footer {
                margin-top: 20px;
                font-size: 12px;
                color: #666;
              }
            </style>
          </head>
          <body>
            <div class="email-container">
              <h2>One-Time Password (OTP)</h2>
              <p>Hello, ${name}</p>
              <p>Thank you for registering. Please use the following OTP to verify your account:</p>
              <div class="otp-box">${otpCode}</div>
              <p>This OTP is valid for the next 10 minutes.</p>
              <div class="footer">
                <p>If you did not request this, please ignore this email.</p>
                <p>This is an automated message. Do not reply.</p>
              </div>
            </div>
          </body>
        </html>
      `;

      const result = await this.mailerService.sendMail({
        to: email,
        subject: 'Verify Your Email Address',
        text: `Hello ${name},\n\nYour OTP is: ${otpCode}\n\nThis OTP is valid for the next 5 minutes.\n\nIf you did not request this, please ignore this email.`,
        html: htmlContent,
      });

      this.logger.log(`Verification email sent successfully to ${email}`);
      return result;
    } catch (error) {
      this.logger.error('Failed to send verification email', {
        error: error.message,
        stack: error.stack,
        email,
      });

      // ⛑ Rethrow known NestJS exceptions (e.g. BadRequestException)
      if (error instanceof HttpException) {
        throw error;
      }

      // Determine the appropriate error response
      if (error.code === 'ECONNREFUSED') {
        throw new HttpException(
          'Email service is currently unavailable',
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      } else if (error.code === 'EENVMISSING') {
        throw new HttpException(
          'Email service misconfigured',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      } else if (error.code === 'EINVALIDEMAIL') {
        throw new HttpException(
          'Invalid email address provided',
          HttpStatus.BAD_REQUEST,
        );
      } else {
        throw new HttpException(
          'Failed to send verification email',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }
}
