import { BadRequestException } from '@nestjs/common';
import * as path from 'path';

export const fileNameEditor = (
  file: Express.Multer.File,
  callback: (error: Error | null, filename: string) => void,
) => {
  const fileExtension = path.extname(file.originalname);
  const baseName = path.basename(file.originalname, fileExtension);
  const timestamp = Date.now();
  const newFileName = `${baseName}_${timestamp}${fileExtension}`;

  callback(null, newFileName);
};

export const imageFileFilter = (
  file: Express.Multer.File,
  callback: (error: Error | null, acceptFile: boolean) => void,
) => {
  if (!file.mimetype.match(/^image\/(jpg|jpeg|png|gif|webp)$/)) {
    return callback(
      new BadRequestException('Only image files are allowed'),
      false,
    );
  }
  callback(null, true);
};
