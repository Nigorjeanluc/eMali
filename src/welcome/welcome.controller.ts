import { Controller, Get } from '@nestjs/common';

@Controller('welcome')
export class WelcomeController {
  @Get()
  welcome(): string {
    return 'Welcome to the eMali Estates API!';
  }
}
