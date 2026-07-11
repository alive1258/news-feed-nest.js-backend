import { Injectable } from '@nestjs/common';
import { FileUploadsProvider } from './providers/create-file-uploads.providers';
import { UpdateFileUploadsProvider } from './providers/update-file-uploads.providers';
import { DeleteFileUploadsProvider } from './providers/delate-file-uploads.providers';
import { MulterFile } from '../types/file.types';

@Injectable()
export class FileUploadsService {
  constructor(
    private readonly fileUploadsProvider: FileUploadsProvider,
    private readonly updateFileUploadsProvider: UpdateFileUploadsProvider,
    private readonly deleteFileUploadsProvider: DeleteFileUploadsProvider,
  ) {}

  public async fileUploads(files: MulterFile[]): Promise<string | string[]> {
    return await this.fileUploadsProvider.handleFileUploads(files);
  }

  public async updateFileUploads({
    currentFile,
    oldFile,
  }: {
    currentFile: MulterFile;
    oldFile: string;
  }): Promise<string> {
    return await this.updateFileUploadsProvider.handleUpdateFileUploads(
      currentFile,
      oldFile,
    );
  }

  /**
   * Delete file
   */
  public async deleteFileUploads(currentFile: string): Promise<string> {
    return await this.deleteFileUploadsProvider.handleDeleteFileUploads(
      currentFile,
    );
  }
}
