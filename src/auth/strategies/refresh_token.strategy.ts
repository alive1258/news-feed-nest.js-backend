import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, JwtFromRequestFunction } from 'passport-jwt';
import { Request } from 'express';
import { DataSource } from 'typeorm';
import { ActiveUserData } from '../interface/active-user-data.interface';
import { User } from 'src/modules/users/entities/user.entity';

interface CustomRequest extends Request {
  cookies: Record<string, any>;
}

const tokenExtractor: JwtFromRequestFunction = (
  req: CustomRequest,
): string | null => {
  if (!req) return null;

  const cookieToken = req.cookies?.refreshToken as string | undefined;
  if (typeof cookieToken === 'string') return cookieToken;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  return null;
};

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    private readonly config: ConfigService,
    private readonly dataSource: DataSource,
  ) {
    super({
      jwtFromRequest: tokenExtractor,
      secretOrKey: config.getOrThrow<string>('JWT_REFRESH_SECRET'),
      passReqToCallback: true,
      ignoreExpiration: false, // পাসপোর্ট নিজেই সিগনেচার এবং মেয়াদ ভ্যালিড করবে
    });
  }

  async validate(
    req: Request,
    payload: { sub: string; email?: string },
  ): Promise<ActiveUserData> {
    if (!payload?.sub) {
      throw new UnauthorizedException('Invalid token payload');
    }

    const userRepository = this.dataSource.getRepository(User);

    // ডাটাবেজে ইউজার আছে কি না শুধু তা নিশ্চিত করা হচ্ছে
    const user = await userRepository.findOne({
      where: { id: payload.sub },
      select: ['id', 'email'],
    });

    if (!user) {
      throw new UnauthorizedException('Invalid or revoked refresh token');
    }

    // পিওরলি টোকেন ভ্যালিডেশনের ওপর ভিত্তি করে রেসপন্স
    return {
      sub: user.id,
      email: user.email,
    };
  }
}
