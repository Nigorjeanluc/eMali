import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { OAuth2Client } from 'google-auth-library';

@Injectable()
export class GoogleAuthGuard extends AuthGuard('jwt') {
  private googleClient: OAuth2Client;

  constructor() {
    super();
    this.googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  }

  async canActivate(context: any) {
    const request = context.switchToHttp().getRequest();
    const accessToken = request.body.accessToken;

    if (!accessToken) {
      throw new UnauthorizedException('No accessToken provided');
    }

    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken: accessToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      request.user = {
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
      };

      return true;
    } catch (error) {
      // console.log(error);
      throw new UnauthorizedException(`Invalid credentials: ${error.message}`);
    }
  }
}
