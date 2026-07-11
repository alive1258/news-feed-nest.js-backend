import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { v2 as Cloudinary } from 'cloudinary';

@Injectable()
export class DeleteFileUploadsProvider {
  constructor(
    @Inject('CLOUDINARY')
    private readonly cloudinary: typeof Cloudinary,
  ) {}

  async handleDeleteFileUploads(currentFile: string): Promise<string> {
    if (!currentFile) {
      throw new NotFoundException('No file provided');
    }

    try {
      const publicId = currentFile.split('/').pop()?.split('.')[0];

      if (!publicId) {
        throw new BadRequestException('Invalid image url');
      }

      await this.cloudinary.uploader.destroy(`uploads/${publicId}`);

      return 'deleted';
    } catch (error: any) {
      throw new BadRequestException(`File deletion failed: ${error.message}`);
    }
  }
}
