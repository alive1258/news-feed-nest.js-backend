import { Injectable } from '@nestjs/common';
import { HashingProvider } from './hashing.provider';
import * as bcrypt from 'bcrypt';

@Injectable()
export class BcryptProvider implements HashingProvider {
  public async hashPassword(data: string | Buffer): Promise<string> {
    try {
      const salt = await bcrypt.genSalt(10);
      return await bcrypt.hash(data, salt);
    } catch (error) {
      throw new Error(`Failed to hash password: ${(error as Error).message}`);
    }
  }

  public async comparePassword(
    data: string | Buffer,
    encrypted: string,
  ): Promise<boolean> {
    try {
      return await bcrypt.compare(data, encrypted);
    } catch (error) {
      throw new Error(
        `Failed to compare password: ${(error as Error).message}`,
      );
    }
  }
}
