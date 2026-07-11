import { ApiProperty } from '@nestjs/swagger';

export class TokenResponse {
  @ApiProperty({ description: 'JWT Access Token' })
  accessToken: string;

  @ApiProperty({ description: 'JWT Refresh Token' })
  refreshToken: string;
}

export class AuthResponse {
  @ApiProperty({ description: 'User ID' })
  id: string;

  @ApiProperty({ description: 'User First Name', nullable: true })
  firstName: string | null;

  @ApiProperty({ description: 'User Last Name', nullable: true })
  lastName: string | null;

  @ApiProperty({ description: 'User Email' })
  email: string;

  @ApiProperty({ description: 'User Role', required: false })
  role: string | undefined;

  @ApiProperty({ description: 'JWT Access Token' })
  accessToken: string;

  @ApiProperty({ description: 'JWT Refresh Token' })
  refreshToken: string;
}

export class SignUpResponse {
  @ApiProperty({ description: 'Success Message' })
  message: string;
}

export class OtpResponse {
  @ApiProperty({ description: 'Success Message' })
  message: string;
}

export class VerifyOtpResponse {
  @ApiProperty({ description: 'Verification Status' })
  isVerified: boolean;

  @ApiProperty({ description: 'Success Message' })
  message: string;
}
