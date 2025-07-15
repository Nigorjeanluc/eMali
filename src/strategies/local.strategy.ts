import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from 'src/auth/services/auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super();
  }

  async validate(identifier: string, password: string) {
    console.log('Inside LocalStrategy');
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { accessToken, user } = await this.authService.login(
      identifier,
      password,
    );
    if (!user) throw new UnauthorizedException();
    return user;
  }
}
