import { Test, TestingModule } from '@nestjs/testing';
import { WelcomeController } from './welcome.controller';
import { Response } from 'express';
import { readFileSync } from 'fs';
import { join } from 'path';

describe('WelcomeController', () => {
  let controller: WelcomeController;
  const mockRes = (): Response => {
    // minimal Express‑style mock
    const res: Partial<Response> = {};
    res.type = jest.fn().mockReturnValue(res);
    res.send = jest.fn().mockReturnValue(res);
    return res as Response;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WelcomeController],
    }).compile();

    controller = module.get<WelcomeController>(WelcomeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should serve index.html content', () => {
    const res = mockRes();
    controller.welcome(res);

    // expected HTML = exactly what the controller reads
    const expectedHtml = readFileSync(
      join(__dirname, '../../', 'public', 'index.html'),
      'utf8',
    );

    expect(res.type).toHaveBeenCalledWith('html');
    expect(res.send).toHaveBeenCalledWith(expectedHtml);
  });
});
