import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UserOTPDto {
  @ApiProperty({
    description: 'User Id',
  })
  @IsString()
  @IsNotEmpty()
  user_id: string;

  @ApiProperty({
    description: 'OTP Code',
  })
  @IsString()
  @IsNotEmpty()
  otp_code: string;
}
