import {
  Body,
  Controller,
  Post,
  Req,
  Res,
  HttpStatus,
  UseGuards,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthService } from '../services/auth.service';
import {
  AuthResponseDto,
  CreateUserDto,
  LoginDto,
  VerifyOtpDto,
} from '../dtos/auth.dto';
import { Request, Response } from 'express';
import { JWTAuthGuard } from '../../guards/jwt/jwt.guard';

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

  @Post('verify-otp')
  @UseGuards(JWTAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Verify the one‑time password (OTP)',
    description:
      'The identifier (e‑mail) is taken from the access token; the body only needs the OTP string.',
  })
  @ApiBody({ type: VerifyOtpDto })
  @ApiOkResponse({
    description: 'OTP verified successfully',
    schema: { example: { success: true } },
  })
  @ApiUnauthorizedResponse({
    description: 'Access token invalid or OTP does not match / is expired',
    type: UnauthorizedException,
  })
  @ApiBadRequestResponse({
    description: 'Malformed request body (validation failed)',
    type: BadRequestException,
  })
  async verifyOtp(
    @Body() dto: VerifyOtpDto,
    @Req() req: Request,
  ): Promise<{ success: boolean }> {
    // identifier (e‑mail) comes from decoded JWT
    const { email } = req.user as { email: string };

    await this.authService.verifyOtp(email, dto.otp);

    return { success: true };
  }

  @Post('refresh-otp')
  @UseGuards(JWTAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Resend OTP to user email',
    description:
      'Sends a new OTP to the e-mail address extracted from the accessToken.',
  })
  @ApiOkResponse({
    description: 'OTP sent successfully',
    schema: { example: { success: true } },
  })
  @ApiUnauthorizedResponse({ description: 'Invalid or expired access token' })
  @ApiBadRequestResponse({ description: 'Email not found or OTP failed' })
  async refreshOtp(@Req() req: Request): Promise<{ success: boolean }> {
    const { email } = req.user as { email: string };
    await this.authService.refreshOtp(email);
    return { success: true };
  }

  @Post('logout')
  @UseGuards(JWTAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Log the current user out' })
  @ApiOkResponse({
    description: 'Token invalidated; client should delete local copy',
    schema: { example: { success: true } },
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid / expired JWT supplied',
    type: UnauthorizedException,
  })
  async logout(@Req() req: Request): Promise<{ success: boolean }> {
    const rawJwt = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
    await this.authService.logout(rawJwt);
    return { success: true };
  }
}
