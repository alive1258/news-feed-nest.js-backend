import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { v2 as Cloudinary, UploadApiResponse } from 'cloudinary';
import { MulterFile } from 'src/common/types/file.types';

@Injectable()
export class UpdateFileUploadsProvider {
  constructor(
    @Inject('CLOUDINARY')
    private readonly cloudinary: typeof Cloudinary,
  ) {}

  async handleUpdateFileUploads(
    currentFile: MulterFile,
    oldFile: string,
  ): Promise<string> {
    if (!currentFile?.buffer) {
      return oldFile;
    }

    try {
      if (oldFile) {
        const publicId = this.extractPublicIdFromUrl(oldFile);
        if (publicId) {
          const deletionResult =
            await this.cloudinary.uploader.destroy(publicId);
          console.log('Old file deletion result:', deletionResult);
        }
      }

      return await this.uploadToCloudinary(currentFile);
    } catch (error: any) {
      console.error('File update error:', error);
      throw new BadRequestException(`Image update failed: ${error.message}`);
    }
  }

  /**
   * Upload file to Cloudinary
   */
  private async uploadToCloudinary(file: MulterFile): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const uploadStream = this.cloudinary.uploader.upload_stream(
        {
          folder: 'social_media_posts', // Better to use a specific folder name
          allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
          transformation: [{ quality: 'auto' }, { fetch_format: 'auto' }],
        },
        (error: Error | undefined, result: UploadApiResponse | undefined) => {
          if (error) {
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
  }

  private extractPublicIdFromUrl(url: string): string | null {
    try {
      const uploadIndex = url.indexOf('/upload/');
      if (uploadIndex === -1) return null;

      let afterUpload = url.substring(uploadIndex + 8);
      const versionMatch = afterUpload.match(/^v\d+\//);
      if (versionMatch) {
        afterUpload = afterUpload.substring(versionMatch[0].length);
      }
      const lastDotIndex = afterUpload.lastIndexOf('.');
      if (lastDotIndex !== -1) {
        afterUpload = afterUpload.substring(0, lastDotIndex);
      }

      return afterUpload;
    } catch (error) {
      console.error('Error extracting public ID:', error);
      return null;
    }
  }
}
