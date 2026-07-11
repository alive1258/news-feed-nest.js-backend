// import {
//   forwardRef,
//   Inject,
//   Injectable,
//   NotFoundException,
//   RequestTimeoutException,
//   UnauthorizedException,
// } from '@nestjs/common';
// import { HashingProvider } from './hashing.provider';
// import { MailService } from 'src/modules/mail/mail.service';
// import { SignInDto } from '../dto/signin.dto';
// import { UsersService } from 'src/modules/users/users.service';

// @Injectable()
// export class SignInProvider {
//   constructor(
//     @Inject(forwardRef(() => UsersService))
//     private readonly usersService: UsersService,
//     private readonly hashingProvider: HashingProvider,

//     private readonly mailService: MailService,
//   ) {}

//   public async signIn(signInDto: SignInDto) {
//     const user = await this.usersService.findOneByEmail(signInDto.email);

//     if (!user) {
//       throw new NotFoundException("User couldn't found! Check your email.");
//     }

//     if (user.is_verified === false) {
//       throw new NotFoundException('User is not verified.');
//     }

//     let isEqual: boolean = false;
//     try {
//       isEqual = await this.hashingProvider.comparePassword(
//         signInDto.password,
//         user.password,
//       );
//     } catch (error) {
//       throw new RequestTimeoutException(error, {
//         description: 'Could not comparing passwords',
//       });
//     }

//     if (!isEqual) {
//       throw new UnauthorizedException('Incorrect password');
//     }
//     const expireTime = 2 * 60 * 1000;
//     const result = await this.mailService.resendOtp(user, expireTime);

//     return result;
//   }
// }

import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
  RequestTimeoutException,
  UnauthorizedException,
} from '@nestjs/common';
import { HashingProvider } from './hashing.provider';
import { SignInDto } from '../dto/signin.dto';
import { UsersService } from 'src/modules/users/users.service';
import { GenerateTokensProvider } from './generate-tokens.provider';

@Injectable()
export class SignInProvider {
  constructor(
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
    private readonly hashingProvider: HashingProvider,

    private readonly generateTokensProvider: GenerateTokensProvider,
  ) {}

  public async signIn(signInDto: SignInDto) {
    const user = await this.usersService.findOneByEmail(signInDto.email);

    if (!user) {
      throw new NotFoundException("User couldn't be found! Check your email.");
    }

    let isEqual: boolean = false;
    try {
      isEqual = await this.hashingProvider.comparePassword(
        signInDto.password,
        user.password,
      );
    } catch (error) {
      throw new RequestTimeoutException(error, {
        description: 'Could not compare passwords',
      });
    }

    if (!isEqual) {
      throw new UnauthorizedException('Incorrect password');
    }

    const tokens = await this.generateTokensProvider.generateTokens(user);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
    };
  }
}
