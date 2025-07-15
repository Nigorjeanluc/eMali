import { Test, TestingModule } from '@nestjs/testing';
import { SMSService } from './sms.service';

// Mock AfricasTalking and its SMS method
const sendMock = jest.fn();
const smsMock = { send: sendMock };

jest.mock('africastalking', () => {
  return jest.fn(() => ({
    SMS: smsMock,
  }));
});

describe('SMSService', () => {
  let service: SMSService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [SMSService],
    }).compile();

    service = module.get<SMSService>(SMSService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should send SMS successfully', async () => {
    const fakeResponse = { status: 'success' };
    sendMock.mockResolvedValue(fakeResponse);

    const response = await service.sendSMS(
      '+250700000000',
      'Hello world',
      'eMali',
    );
    expect(sendMock).toHaveBeenCalledWith({
      to: '+250700000000',
      message: 'Hello world',
      from: 'eMali',
    });
    expect(response).toBe(fakeResponse);
  });

  it('should throw and log error if send fails', async () => {
    const error = new Error('Failed to send SMS');
    sendMock.mockRejectedValue(error);
    const consoleSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    await expect(service.sendSMS('+250700000000', 'Hello')).rejects.toThrow(
      'Failed to send SMS',
    );
    expect(consoleSpy).toHaveBeenCalledWith('SMS sending failed:', error);

    consoleSpy.mockRestore();
  });
});
