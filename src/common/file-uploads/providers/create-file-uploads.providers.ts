import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  v2 as Cloudinary,
  UploadApiErrorResponse,
  UploadApiResponse,
} from 'cloudinary';
import { MulterFile } from 'src/common/types/file.types';

@Injectable()
export class FileUploadsProvider {
  constructor(
    @Inject('CLOUDINARY')
    private readonly cloudinary: typeof Cloudinary,
  ) {}

  async handleFileUploads(files: MulterFile[]): Promise<string[]> {
    if (!files || files.length === 0) {
      throw new NotFoundException('No file(s) provided');
    }

    // Validate each file
    for (const file of files) {
      this.validateFile(file);
    }

    try {
      const uploads = files.map((file) => {
        if (!file.buffer) {
          throw new BadRequestException('File buffer missing');
        }

        return new Promise<string>((resolve, reject) => {
          const uploadStream = this.cloudinary.uploader.upload_stream(
            {
              folder: 'social_media_posts',
              allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
              transformation: [{ quality: 'auto' }, { fetch_format: 'auto' }],
              resource_type: 'auto',
            },
            (
              error: UploadApiErrorResponse | undefined,
              result: UploadApiResponse | undefined,
            ) => {
              if (error) {
                console.error('Cloudinary upload error:', error);
                return reject(
                  new BadRequestException(`Cloudinary error: ${error.message}`),
                );
              }

              if (!result || !result.secure_url) {
                return reject(
                  new BadRequestException(
                    'Cloudinary upload failed - no URL returned',
                  ),
                );
              }

              resolve(result.secure_url);
            },
          );

          uploadStream.end(file.buffer);
        });
      });

      const uploadedUrls = await Promise.all(uploads);
      return uploadedUrls;
    } catch (error: any) {
      console.error('File upload error:', error);
      throw new BadRequestException(`File upload error: ${error.message}`);
    }
  }

  /**
   * Validate file type and size
   */
  private validateFile(file: MulterFile): void {
    // Allowed MIME types
    const allowedMimeTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
    ];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `Invalid file type: ${file.mimetype}. Allowed types: ${allowedMimeTypes.join(', ')}`,
      );
    }

    // Max file size: 10MB
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new BadRequestException(
        `File size too large: ${(file.size / (1024 * 1024)).toFixed(2)}MB. Maximum allowed: ${maxSize / (1024 * 1024)}MB`,
      );
    }
  }
}
