import {
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { ActiveUserData } from '../interface/active-user-data.interface';

@Injectable()
export class RefreshTokenGuard extends AuthGuard('jwt-refresh') {
  private readonly logger = new Logger(RefreshTokenGuard.name);

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();

    return super.canActivate(context) as boolean;
  }

  handleRequest<TUser = ActiveUserData>(
    err: unknown,
    user: TUser | false | null,
    _info: unknown,
    _context: ExecutionContext,
    _status?: unknown,
  ): TUser {
    if (err instanceof Error) {
      throw new UnauthorizedException('Authentication error: ' + err.message);
    }

    if (!user) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    return user;
  }
}
