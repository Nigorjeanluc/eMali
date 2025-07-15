// sms.module.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { SMSModule } from './sms.module';
import { SMSService } from './services/sms.service';

// Mock africastalking before importing SMSService to avoid actual env var reads
jest.mock('africastalking', () => {
  return jest.fn().mockImplementation(() => ({
    SMS: {
      send: jest.fn().mockResolvedValue('mocked response'),
    },
  }));
});

describe('SMSModule', () => {
  let module: TestingModule;
  let smsService: SMSService;

  beforeAll(async () => {
    // Set dummy env vars before module initialization
    process.env.AT_API_KEY = 'dummy_api_key';
    process.env.AT_USERNAME = 'dummy_username';

    module = await Test.createTestingModule({
      imports: [SMSModule],
    }).compile();

    smsService = module.get<SMSService>(SMSService);
  });

  it('should compile the module', () => {
    expect(module).toBeDefined();
  });

  it('should provide SMSService', () => {
    expect(smsService).toBeDefined();
  });

  it('should send SMS using SMSService', async () => {
    const response = await smsService.sendSMS(
      '+250700000000',
      'Test message',
      'eMali',
    );
    expect(response).toBe('mocked response');
  });
});
