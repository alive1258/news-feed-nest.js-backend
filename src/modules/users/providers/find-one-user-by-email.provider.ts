import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class FindOneUserByEmailProvider {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  public async findOneByEmail(email: string): Promise<User> {
    let user: User | null;

    try {
      user = await this.userRepository.findOneBy({ email });
    } catch (error) {
      console.error('DB error while fetching user by email:', error);

      throw new InternalServerErrorException(
        'Unable to fetch user at this time',
      );
    }

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }
}
