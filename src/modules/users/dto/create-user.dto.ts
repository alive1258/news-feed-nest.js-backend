

import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  MaxLength,
  MinLength,
  IsNotEmpty,
  Matches,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    example: 'John',
    description: 'First name of the user',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  first_name: string;

  @ApiProperty({
    example: 'Doe',
    description: 'Last name of the user',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  last_name: string;

  @ApiProperty({
    example: 'john@example.com',
    description: 'Email address',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'StrongP@ss123',
    description: 'User password',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(255)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/, {
    message:
      'Password must contain uppercase, lowercase, number and special character',
  })
  password: string;
}

export class UserResponseDto {
  @ApiProperty({ example: 'd3b07384-d113-4956-a5e1-075844874f67' })
  id: string; // Entity-তে UUID ব্যবহার করায় এখানে টাইপ string করা হলো

  @ApiProperty({ example: 'John' })
  first_name: string;

  @ApiProperty({ example: 'Doe' })
  last_name: string;

  @ApiProperty({ example: 'john@example.com' })
  email: string;

  @ApiProperty({ example: true })
  is_verified: boolean;

  @ApiProperty({ example: '2026-07-11T00:00:00.000Z' })
  created_at: Date;

  @ApiProperty({ example: '2026-07-11T00:00:00.000Z' })
  updated_at: Date;
}
