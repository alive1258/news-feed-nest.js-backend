import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { ApiDoc } from './decorators/swagger.decorator';
import { AuthResponse, TokenResponse } from './response';
import { Auth } from './decorators/auth.decorator';
import { AuthType } from './enums/auth-type.enum';
import { SignInDto } from './dto/signin.dto';
import type { Request } from 'express';
import { JwtOrApiKeyGuard } from './guards/jwt-or-api-key.guard';
import { RefreshTokenGuard } from './guards/refresh-token.guard';

@ApiTags('Authentication')
@Controller({
  path: 'auth',
  version: '1',
})
export class AuthController {
  constructor(
    /**
     * inject auth service
     */
    private readonly authService: AuthService,
  ) {}

  @ApiDoc({
    summary: 'User Sign-In',
    description:
      'Handles user sign-in with email and password. Sets refresh token as HTTP-only cookie.',
    response: AuthResponse,
    status: HttpStatus.OK,
  })
  @Post('sign-in')
  @HttpCode(HttpStatus.OK)
  @Auth(AuthType.None)
  public async SignIn(@Body() signInDto: SignInDto) {
    return await this.authService.signIn(signInDto);
  }

  /**
   * Get me controller
   */
  @UseGuards(JwtOrApiKeyGuard)
  @Get('get-me')
  @ApiDoc({
    summary: 'User Logout',
    description: 'Signs out user by invalidating their refresh token.',
    status: HttpStatus.OK,
  })
  getMe(@Req() req: Request) {
    return this.authService.getMe(req);
  }

  // refresh-token
  @ApiDoc({
    summary: 'Token Refresh',
    description:
      'Generates new access and refresh tokens using existing refresh token.',
    response: TokenResponse,
    status: HttpStatus.OK,
  })
  @Post('refresh-token')
  @UseGuards(RefreshTokenGuard)
  @HttpCode(HttpStatus.OK)
  @Auth(AuthType.None)
  public async refreshTokens(@Req() req: Request) {
    const refreshToken = req.cookies?.refreshToken as string;
    return await this.authService.refreshTokens(refreshToken);
  }

  @ApiDoc({
    summary: 'User Logout',
    description: 'Signs out user by invalidating their refresh token.',
    status: HttpStatus.OK,
  })
  @Post('sign-out')
  @UseGuards(JwtOrApiKeyGuard)
  @HttpCode(HttpStatus.OK)
  @Auth(AuthType.Bearer)
  public logOut() {
    return {
      message: 'Successfully signed out.',
    };
  }
}
