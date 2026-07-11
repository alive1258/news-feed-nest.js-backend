
import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { User } from '../entities/user.entity';
import { DataSource, QueryFailedError } from 'typeorm';
import { CreateUserDto } from '../dto/create-user.dto';
import { HashingProvider } from 'src/auth/providers/hashing.provider';

@Injectable()
export class CreateUserProvider {
  constructor(
    @Inject(HashingProvider)
    private readonly hashingProvider: HashingProvider,
    private readonly dataSource: DataSource, // MailService ডিপেন্ডেন্সি বাদ দেওয়া হয়েছে
  ) {}

  /**
   * Creates a new verified user instantly.
   */
  public async createUser(createUserDto: CreateUserDto): Promise<User> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const hashedPassword = await this.hashingProvider.hashPassword(
        createUserDto.password,
      );

      const newUser = queryRunner.manager.create(User, {
        first_name: createUserDto.first_name,
        last_name: createUserDto.last_name,
        email: createUserDto.email,
        password: hashedPassword,
        is_verified: true,
      });

      const savedUser = await queryRunner.manager.save(newUser);

      await queryRunner.commitTransaction();
      return savedUser;
    } catch (error) {
      await queryRunner.rollbackTransaction();

      if (error instanceof QueryFailedError) {
        const driverError = error.driverError as { code?: string };

        if (driverError.code === '23505') {
          throw new BadRequestException('Email already exists.');
        }
      }

      console.error('Create user transaction failed:', error);
      throw new InternalServerErrorException(
        'Unable to create user at this time.',
      );
    } finally {
      await queryRunner.release();
    }
  }
}
