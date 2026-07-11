import { Global, Module } from '@nestjs/common';
import { FileUploadsService } from './file-uploads.service';
import { FileUploadsProvider } from './providers/create-file-uploads.providers';
import { UpdateFileUploadsProvider } from './providers/update-file-uploads.providers';
import { DeleteFileUploadsProvider } from './providers/delate-file-uploads.providers';
import { HttpModule } from '@nestjs/axios';
import { CloudinaryProvider } from 'src/config/cloudinary.provider';

@Global()
@Module({
  providers: [
    CloudinaryProvider,
    FileUploadsService,
    FileUploadsProvider,
    UpdateFileUploadsProvider,
    DeleteFileUploadsProvider,
  ],
  imports: [HttpModule],
  exports: [FileUploadsService],
})
export class FileUploadsModule {}
