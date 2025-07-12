import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { readFileSync } from 'fs';
import { join } from 'path';

@Controller()
export class WelcomeController {
  @Get()
  welcome(@Res() res: Response) {
    const html = readFileSync(
      join(process.cwd(), 'public', 'index.html'),
      'utf8',
    );
    res.type('html').send(html);
  }
}
