import { Body, Controller, Post, Req, Res, HttpStatus } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from '../services/auth.service';
import { AuthResponseDto, CreateUserDto, LoginDto } from '../dtos/auth.dto';
import { Request, Response } from 'express';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/signup')
  @ApiOperation({ summary: 'Create a new user account' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({
    status: 201,
    description: 'User successfully registered',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid user data' })
  async signup(
    @Body() userDto: CreateUserDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const result = await this.authService.signup(userDto);
    return res.status(HttpStatus.CREATED).json({
      status: 'success',
      message: 'User successfully registered',
      data: {
        accessToken: result.accessToken,
        user: result.user,
      },
    });
  }

  @Post('/login')
  @ApiOperation({ summary: 'Log in with identifier and password' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'User logged in successfully' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(
    @Body() loginDto: LoginDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const result = await this.authService.login(
      loginDto.identifier,
      loginDto.password,
    );
    return res.status(HttpStatus.OK).json({
      status: 'success',
      message: 'User logged in successfully',
      data: {
        accessToken: result.accessToken,
        user: result.user,
      },
    });
  }
}
