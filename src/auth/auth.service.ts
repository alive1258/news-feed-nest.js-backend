// import { BadRequestException, Injectable } from '@nestjs/common';
// import { SignInDto } from './dto/signin.dto';
// import { InjectRepository } from '@nestjs/typeorm';
// import { User } from 'src/modules/users/entities/user.entity';
// import { SignInProvider } from './providers/sign-in.provider';
// import { RefreshTokensProvider } from './providers/refresh-tokens.provider';
// import { VerifyOTPProvider } from './providers/veryfy-otp.provider';
// import { UsersService } from 'src/modules/users/users.service';
// import { MailService } from 'src/modules/mail/mail.service';
// import { UserOTPDto } from './dto/user-otp.dto';
// import { OtpResponse } from './response';
// import { Request } from 'express';
// import { Repository } from 'typeorm';

// @Injectable()
// export class AuthService {
//   constructor(
//     @InjectRepository(User)
//     private readonly usersRepository: Repository<User>,
//     private readonly signInProvider: SignInProvider,
//     private readonly refreshTokensProvider: RefreshTokensProvider,
//     private readonly verifyOTPProvider: VerifyOTPProvider,
//     private readonly usersService: UsersService,
//     private readonly mailService: MailService,
//   ) {}

//   public async signIn(signInDto: SignInDto) {
//     return await this.signInProvider.signIn(signInDto);
//   }

//   public async refreshTokens(refreshToken: string) {
//     return await this.refreshTokensProvider.refreshTokens(refreshToken);
//   }

//   public async verifyOTP(userOTPDto: UserOTPDto) {
//     return await this.verifyOTPProvider.verifyOTP(userOTPDto);
//   }

//   public async resendOTP(
//     email: string,
//     expireTime: number = 5 * 60 * 1000,
//   ): Promise<OtpResponse> {
//     const user = await this.usersService.findOneByEmail(email);

//     if (!user) throw new BadRequestException('User not found.');
//     if (user.is_verified)
//       throw new BadRequestException('User is already verified.');

//     await this.mailService.resendOtp(user, expireTime);

//     return { message: 'OTP has been resent successfully.' };
//   }

//   public async getMe(req: Request): Promise<{ user: User }> {
//     // get user id

//     const user_id = req?.user?.sub;

//     if (!user_id) {
//       throw new BadRequestException('You have to Sign in.');
//     }
//     let result = {} as any;
//     // Fetch user with valid relations
//     const user = await this.usersService.findOneForResendOTP(user_id);

//     result.user = user;

//     return {
//       user: result?.user,
//     };
//   }

//   public async resendForgetPasswordOtp(
//     userId: string,
//     email: string,
//     expireTime: number = 5 * 60 * 1000, // default 5 minutes
//   ): Promise<OtpResponse> {
//     // Validate user
//     const user = await this.usersService.findOneForResendOTP(userId);
//     if (!user || user.email !== email) {
//       throw new BadRequestException('User not found or email mismatch.');
//     }

//     // Send OTP via mail service
//     await this.mailService.resendOtp(user, expireTime);

//     return { message: 'OTP has been resent successfully.' };
//   }

//   /**
//    * Clean up expired refresh tokens (call this from cron job)
//    */
// }

import { BadRequestException, Injectable } from '@nestjs/common';
import { SignInDto } from './dto/signin.dto';
import { SignInProvider } from './providers/sign-in.provider';
import { RefreshTokensProvider } from './providers/refresh-tokens.provider';
import { UsersService } from 'src/modules/users/users.service';
import { Request } from 'express';

@Injectable()
export class AuthService {
  constructor(
    // ১. @InjectRepository(User) ভুল ডেকোরেটরটি এখান থেকে রিমুভ করা হয়েছে
    private readonly signInProvider: SignInProvider,
    private readonly refreshTokensProvider: RefreshTokensProvider,
    private readonly usersService: UsersService, // ওটিপি প্রোভাইডার রিমুভড
  ) {}

  public async signIn(signInDto: SignInDto) {
    return await this.signInProvider.signIn(signInDto);
  }

  public async refreshTokens(refreshToken: string) {
    return await this.refreshTokensProvider.refreshTokens(refreshToken);
  }

  public async getMe(req: Request) {
    const user_id = req?.user?.sub;

    if (!user_id) {
      throw new BadRequestException('You have to Sign in.');
    }

    // ২. ওটিপি মেথডের পরিবর্তে আমাদের আপডেট করা findOneById মেথডটি কল করা হলো
    const user = await this.usersService.findOneById(user_id);

    return { user };
  }
}
