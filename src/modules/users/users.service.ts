

import { CreateUserProvider } from './providers/create-user.provider';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  RequestTimeoutException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import { UpdateUserDto } from './dto/update-user.dto';
import { HashingProvider } from 'src/auth/providers/hashing.provider';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,

    private readonly createUserProvider: CreateUserProvider,
    private readonly hashingProvider: HashingProvider,
  ) {}

  // Create New user
  public async createUser(createUserDto: CreateUserDto) {
    return await this.createUserProvider.createUser(createUserDto);
  }

  // Find a single user by ID
  public async findOneById(id: string) {
    let user: User | null = null;
    try {
      user = await this.usersRepository.findOneBy({ id });
    } catch (error) {
      throw new RequestTimeoutException(
        `We are currently experiencing a temporary issue processing your request. Please try again later.`,
        {
          description:
            'Error connecting to the Database. Please try again later',
        },
      );
    }

    if (!user) {
      throw new BadRequestException(`The User does not exist.`);
    }
    return user;
  }

  // Find a single user by email
  public async findOneByEmail(email: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('User does not exist');
    }

    return user;
  }

  // Update user by ID with ownership guard
  public async updateUserById(
    targetUserId: string,
    dto: UpdateUserDto,
    requesterId: string,
  ): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id: targetUserId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Authorization check
    const isOwner = user.id === requesterId;
    if (!isOwner) {
      throw new ForbiddenException('You are not allowed to update this user');
    }

    // Secure password hashing
    if (dto.password) {
      user.password = await this.hashingProvider.hashPassword(dto.password);
      delete dto.password;
    }

    Object.assign(user, dto);
    return this.usersRepository.save(user);
  }

  public remove(id: string) {
    return `This action removes a #${id} user`;
  }
}
