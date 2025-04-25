import { Injectable, BadRequestException } from '@nestjs/common';
import { createHash } from 'crypto';
import { promises as fsPromises } from 'fs';
import { join, extname } from 'path';
import { v4 as uuid } from 'uuid';

interface FileInfo {
  filePath: string;
  fileSize: number;
  mimeType: string;
  hash?: string;
}

@Injectable()
export class FileUploadService {
  private readonly uploadDir = join(process.cwd(), 'uploads', 'content');
  private readonly chunkDir = join(process.cwd(), 'uploads', 'chunks');

  constructor() {
    // Create directories if they don't exist
    this.ensureDirectories();
  }

  private async ensureDirectories(): Promise<void> {
    try {
      await fsPromises.mkdir(this.uploadDir, { recursive: true });
      await fsPromises.mkdir(this.chunkDir, { recursive: true });
    } catch (error) {
      console.error('Error creating directories:', error);
    }
  }

  async saveFile(file: Express.Multer.File): Promise<FileInfo> {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    // Generate a unique filename
    const fileHash = this.generateFileHash(file.buffer);
    const uniqueFilename = `${uuid()}${extname(file.originalname)}`;
    const relativePath = join('content', uniqueFilename);
    const fullPath = join(this.uploadDir, uniqueFilename);

    // Save the file
    await fsPromises.writeFile(fullPath, file.buffer);

    return {
      filePath: relativePath,
      fileSize: file.size,
      mimeType: file.mimetype,
      hash: fileHash,
    };
  }

  async saveChunk(
    chunk: Buffer,
    chunkIndex: number,
    totalChunks: number,
    fileId: string,
    originalName: string,
  ): Promise<{ completed: boolean; filePath?: string }> {
    // Create chunk directory for this file if it doesn't exist
    const fileChunkDir = join(this.chunkDir, fileId);
    await fsPromises.mkdir(fileChunkDir, { recursive: true });

    // Save chunk
    const chunkFilePath = join(fileChunkDir, `chunk-${chunkIndex}`);
    await fsPromises.writeFile(chunkFilePath, chunk);

    // Check if all chunks are uploaded
    const uploadedChunks = await fsPromises.readdir(fileChunkDir);
    if (uploadedChunks.length === totalChunks) {
      // All chunks uploaded, combine them
      return await this.combineChunks(fileId, totalChunks, originalName);
    }

    return { completed: false };
  }

  private async combineChunks(
    fileId: string,
    totalChunks: number,
    originalName: string,
  ): Promise<{ completed: boolean; filePath: string; fileSize: number }> {
    const fileChunkDir = join(this.chunkDir, fileId);
    const uniqueFilename = `${uuid()}${extname(originalName)}`;
    const relativePath = join('content', uniqueFilename);
    const fullPath = join(this.uploadDir, uniqueFilename);

    // Create write stream for final file
    const writeStream = fsPromises.open(fullPath, 'w');
    let fileSize = 0;

    // Read and combine chunks
    for (let i = 0; i < totalChunks; i++) {
      const chunkFilePath = join(fileChunkDir, `chunk-${i}`);
      const chunkData = await fsPromises.readFile(chunkFilePath);
      
      // Write chunk to file
      await (await writeStream).write(chunkData);
      fileSize += chunkData.length;
      
      // Delete chunk file
      await fsPromises.unlink(chunkFilePath);
    }

    // Close write stream
    await (await writeStream).close();

    // Remove chunk directory
    await fsPromises.rmdir(fileChunkDir);

    return { completed: true, filePath: relativePath, fileSize };
  }

  async deleteFile(filePath: string): Promise<void> {
    if (!filePath) return;

    try {
      const fullPath = join(process.cwd(), 'uploads', filePath);
      await fsPromises.unlink(fullPath);
    } catch (error) {
      console.error(`Failed to delete file ${filePath}:`, error);
    }
  }

  private generateFileHash(buffer: Buffer): string {
    return createHash('md5').update(buffer).digest('hex');
  }
}