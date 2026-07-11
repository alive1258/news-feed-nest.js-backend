import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { DataSource } from 'typeorm';
import { ActiveUserData } from '../interface/active-user-data.interface';
import { User } from 'src/modules/users/entities/user.entity';

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly config: ConfigService,
    private readonly dataSource: DataSource,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_SECRET'),
    });
  }

  async validate(payload: {
    sub: string;
    email?: string;
  }): Promise<ActiveUserData> {
    if (!payload?.sub) {
      throw new UnauthorizedException('Invalid token payload');
    }

    const userRepository = this.dataSource.getRepository(User);
    const user = await userRepository.findOne({
      where: { id: payload.sub },
      select: ['id', 'email'],
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      sub: user.id,
      email: user.email,
    };
  }
}
