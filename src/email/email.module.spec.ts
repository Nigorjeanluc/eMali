import { Test, TestingModule } from '@nestjs/testing';
import { EmailModule } from './email.module';
import { EmailService } from './services/email.service';

describe('EmailModule', () => {
  let module: TestingModule;
  let emailService: EmailService;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [EmailModule],
    }).compile();

    emailService = module.get<EmailService>(EmailService);
  });

  it('should compile the module', () => {
    expect(module).toBeDefined();
  });

  it('should provide EmailService', () => {
    expect(emailService).toBeInstanceOf(EmailService);
  });
});
