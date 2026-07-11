import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

@Injectable()
export class JwtOrApiKeyGuard extends AuthGuard('jwt') implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    const token = request.cookies?.accessToken;

    if (!token) {
      throw new UnauthorizedException('JWT cookie missing');
    }
    request.headers.authorization = `Bearer ${token}`;

    return (await super.canActivate(context)) as boolean;
  }
}
