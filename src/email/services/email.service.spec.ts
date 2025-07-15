import { Test } from '@nestjs/testing';
import { EmailService } from './email.service';
import { MailerService } from '@nestjs-modules/mailer';
import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';

describe('EmailService', () => {
  let service: EmailService;
  const sendMailMock = jest.fn();

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        EmailService,
        { provide: MailerService, useValue: { sendMail: sendMailMock } },
      ],
    }).compile();

    service = module.get(EmailService);
    jest.clearAllMocks();
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
  });

  it('sends verification e‑mail with correct parameters', async () => {
    sendMailMock.mockResolvedValue({ messageId: 'abc123' });

    const result = await service.sendVerificationEmail(
      'user@example.com',
      'Alice',
      '654321',
    );

    expect(sendMailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'user@example.com',
        subject: 'Verify Your Email Address',
        text: expect.stringContaining('654321'),
        html: expect.stringContaining('<div class="otp-box">654321</div>'),
      }),
    );
    expect(result).toEqual({ messageId: 'abc123' });
  });

  it('throws BadRequestException when e‑mail is missing', async () => {
    await expect(
      service.sendVerificationEmail('', 'Bob', '123456'),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(sendMailMock).not.toHaveBeenCalled();
  });

  it('maps ECONNREFUSED to 503 Service Unavailable', async () => {
    sendMailMock.mockRejectedValue({ code: 'ECONNREFUSED' });

    await expect(
      service.sendVerificationEmail('user@example.com', 'Carol', '111222'),
    ).rejects.toEqual(
      new HttpException(
        'Email service is currently unavailable',
        HttpStatus.SERVICE_UNAVAILABLE,
      ),
    );
  });
});
