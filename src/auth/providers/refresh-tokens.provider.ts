import { Injectable, UnauthorizedException } from '@nestjs/common';
import { GenerateTokensProvider } from './generate-tokens.provider';

@Injectable()
export class RefreshTokensProvider {
  constructor(
    private readonly generateTokensProvider: GenerateTokensProvider,
  ) {}

  public async refreshTokens(refreshToken: string) {
    try {
      const user =
        await this.generateTokensProvider.verifyRefreshToken(refreshToken);

      const result = await this.generateTokensProvider.generateTokens(user);

      return {
        ...result,
        user: {
          id: user.id,
          name: `${user.first_name} ${user.last_name}`.trim(),
          email: user.email,
        },
      };
    } catch (error) {
      throw new UnauthorizedException(
        error instanceof UnauthorizedException
          ? error.message
          : 'Refresh token invalid',
      );
    }
  }
}
