import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import jwtConfig from '../config/jwt.config';
import type { ConfigType } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/modules/users/entities/user.entity';

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}

interface RefreshTokenPayload {
  sub: string;
}

@Injectable()
export class GenerateTokensProvider {
  constructor(
    private readonly jwtService: JwtService,

    @Inject(jwtConfig.KEY)
    private readonly jwt: ConfigType<typeof jwtConfig>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  private signAccessToken(payload: object): Promise<string> {
    return this.jwtService.signAsync(payload, {
      secret: this.jwt.accessSecret,
      expiresIn: this.jwt.accessTokenTlt,
      issuer: this.jwt.issuer,
      audience: this.jwt.audience,
    });
  }

  private signRefreshToken(payload: object): Promise<string> {
    return this.jwtService.signAsync(payload, {
      secret: this.jwt.refreshSecret,
      expiresIn: this.jwt.refreshTokenTlt,
      issuer: this.jwt.issuer,
      audience: this.jwt.audience,
    });
  }

  async generateTokens(user: User): Promise<TokenResponse> {
    const payload = {
      sub: user.id,
      email: user.email,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.signAccessToken(payload),
      this.signRefreshToken(payload),
    ]);

    return { accessToken, refreshToken };
  }

  async verifyRefreshToken(refreshToken: string): Promise<User> {
    let payload: RefreshTokenPayload;

    try {
      payload = await this.jwtService.verifyAsync<RefreshTokenPayload>(
        refreshToken,
        {
          secret: this.jwt.refreshSecret,
          issuer: this.jwt.issuer,
          audience: this.jwt.audience,
        },
      );
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const user = await this.userRepo.findOne({
      where: { id: payload.sub },
      select: ['id', 'email', 'first_name', 'last_name'],
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return user;
  }
}
