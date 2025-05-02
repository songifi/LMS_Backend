import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AssetEntity } from './entities/asset.entity';
import { CdnConfig } from './interfaces/cdn-config.interface';
import * as sharp from 'sharp';
import * as ffmpeg from 'fluent-ffmpeg';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import * as crypto from 'crypto';

@Injectable()
export class MediaOptimizationService {
  constructor(
    @Inject('CDN_CONFIG')
    private readonly config: CdnConfig,
    @InjectRepository(AssetEntity)
    private readonly assetRepository: Repository<AssetEntity>,
  ) {}

  /**
   * Optimize an asset based on its type
   */
  async optimizeAsset(asset: AssetEntity, fileBuffer: Buffer): Promise<void> {
    if (asset.mimeType.startsWith('image/')) {
      await this.optimizeImage(asset, fileBuffer);
    } else if (asset.mimeType.startsWith('video/')) {
      await this.optimizeVideo(asset, fileBuffer);
    }
    // For other asset types, we don't perform optimization
  }

  /**
   * Get image dimensions
   */
  async getImageDimensions(buffer: Buffer): Promise<{ width: number; height: number }> {
    try {
      const metadata = await sharp(buffer).metadata();
      return {
        width: metadata.width || 0,
        height: metadata.height || 0,
      };
    } catch (error) {
      console.error('Error getting image dimensions:', error);
      return { width: 0, height: 0 };
    }
  }

  /**
   * Get video metadata
   */
  async getVideoMetadata(buffer: Buffer): Promise<{ 
    width: number; 
    height: number;
    duration: number;
  }> {
    const tempFilePath = await this.saveTempFile(buffer);
    
    try {
      return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(tempFilePath, (err, metadata) => {
          if (err) {
            reject(err);
            return;
          }
          
          const videoStream = metadata.streams.find(s => s.codec_type === 'video');
          
          resolve({
            width: videoStream?.width || 0,
            height: videoStream?.height || 0,
            duration: metadata.format.duration || 0,
          });
          
          // Clean up temp file
          fs.unlinkSync(tempFilePath);
        });
      });
    } catch (error) {
      console.error('Error getting video metadata:', error);
      // Clean up temp file
      fs.unlinkSync(tempFilePath);
      return { width: 0, height: 0, duration: 0 };
    }
  }

  /**
   * Optimize image asset
   */
  private async optimizeImage(asset: AssetEntity, buffer: Buffer): Promise<void> {
    const optimizedVersions = [];
    const { imageFormats, imageQuality, maxWidth } = this.config.mediaOptimization;
    
    // Create optimized versions for each format and size
    for (const format of imageFormats) {
      const sizes = this.getImageSizes(asset.width || 0, maxWidth);
      
      for (const width of sizes) {
        let sharpInstance = sharp(buffer).resize({ width });
        
        let optimizedBuffer: Buffer;
        let formatOptions = {};
        
        switch (format) {
          case 'webp':
            formatOptions = { quality: imageQuality };
            optimizedBuffer = await sharpInstance.webp(formatOptions).toBuffer();
            break;
          case 'avif':
            formatOptions = { quality: imageQuality };
            optimizedBuffer = await sharpInstance.avif(formatOptions).toBuffer();
            break;
          case 'jpeg':
            formatOptions = { quality: imageQuality };
            optimizedBuffer = await sharpInstance.jpeg(formatOptions).toBuffer();
            break;
          case 'png':
            formatOptions = { quality: imageQuality };
            optimizedBuffer = await sharpInstance.png(formatOptions).toBuffer();
            break;
          default:
            continue;
        }
        
        // Generate a key for the optimized version
        const key = `${asset.id}/${width}w.${format}`;
        
        // Store the optimized version (in a real implementation, this would upload to storage)
        // For now, we'll just track the metadata
        optimizedVersions.push({
          key,
          format,
          quality: imageQuality,
          width,
          size: optimizedBuffer.length,
        });
      }
    }
    
    // Update the asset with optimized versions
    await this.assetRepository.update(
      { id: asset.id },
      { optimizedVersions }
    );
  }

  /**
   * Optimize video asset
   */
  private async optimizeVideo(asset: AssetEntity, buffer: Buffer): Promise<void> {
    const optimizedVersions = [];
    const { videoFormats, videoQuality, maxWidth } = this.config.mediaOptimization;
    const tempFilePath = await this.saveTempFile(buffer);
    
    try {
      // For each format, create optimized versions
      for (const format of videoFormats) {
        if (format === 'hls' && this.config.mediaOptimization.enableAdaptiveBitrate) {
          // Create HLS adaptive bitrate streaming format
          const resolutions = [360, 720, 1080].filter(res => res <= (asset.height || 0));
          
          for (const height of resolutions) {
            const outputKey = `${asset.id}/hls/${height}p/master.m3u8`;
            
            // In a real implementation, this would run ffmpeg to generate HLS segments
            // For now, we'll just track the metadata
            optimizedVersions.push({
              key: outputKey,
              format: 'hls',
              quality: videoQuality,
              width: Math.round((height / (asset.height || 1)) * (asset.width || 0)),
              size: 0, // In a real implementation, we would calculate the actual size
            });
          }
        } else {
          // Create MP4 or WebM versions
          const resolutions = this.getVideoResolutions(asset.height || 0);
          
          for (const height of resolutions) {
            const width = Math.round((height / (asset.height || 1)) * (asset.width || 0));
            const outputKey = `${asset.id}/${height}p.${format}`;
            
            // In a real implementation, this would run ffmpeg for transcoding
            // For now, we'll just track the metadata
            optimizedVersions.push({
              key: outputKey,
              format,
              quality: videoQuality,
              width,
              size: 0, // In a real implementation, we would calculate the actual size
            });
          }
        }
      }
      
      // Update the asset with optimized versions
      await this.assetRepository.update(
        { id: asset.id },
        { optimizedVersions }
      );
    } finally {
      // Clean up temp file
      fs.unlinkSync(tempFilePath);
    }
  }

  /**
   * Select the best version of an asset for the client based on capabilities
   */
  async selectBestVersion(asset: AssetEntity, clientCapabilities: {
    supportedFormats: string[];
    bandwidth: number;
    screenWidth: number;
    devicePixelRatio: number;
  }): Promise<{ key: string; format: string }> {
    if (!asset.optimizedVersions || asset.optimizedVersions.length === 0) {
      return { key: asset.originalKey, format: asset.mimeType.split('/')[1] };
    }
    
    // For images
    if (asset.mimeType.startsWith('image/')) {
      // Find the best format based on client support
      let bestFormat = 'jpeg'; // Default fallback
      
      if (clientCapabilities.supportedFormats.includes('avif')) {
        bestFormat = 'avif';
      } else if (clientCapabilities.supportedFormats.includes('webp')) {
        bestFormat = 'webp';
      }
      
      // Calculate target width based on screen size and pixel ratio
      const targetWidth = Math.min(
        asset.width || 0,
        clientCapabilities.screenWidth * clientCapabilities.devicePixelRatio
      );
      
      // Find the closest width match
      const matchingVersions = asset.optimizedVersions.filter(v => v.format === bestFormat);
      if (matchingVersions.length === 0) {
        return { key: asset.originalKey, format: asset.mimeType.split('/')[1] };
      }
      
      // Find the version with the closest width to our target
      const bestVersionForWidth = matchingVersions.reduce((best, current) => {
        const bestDiff = Math.abs((best.width || 0) - targetWidth);
        const currentDiff = Math.abs((current.width || 0) - targetWidth);
        return currentDiff < bestDiff ? current : best;
      });
      
      return { key: bestVersionForWidth.key, format: bestFormat };
    }
    
    // For videos
    if (asset.mimeType.startsWith('video/')) {
      // Choose format based on client support and bandwidth
      let bestFormat = 'mp4'; // Default fallback
      
      if (this.config.mediaOptimization.enableAdaptiveBitrate && 
          clientCapabilities.supportedFormats.includes('hls')) {
        bestFormat = 'hls';
      } else if (clientCapabilities.supportedFormats.includes('webm')) {
        bestFormat = 'webm';
      }
      
      // For HLS, return the master playlist
      if (bestFormat === 'hls') {
        const hlsVersions = asset.optimizedVersions.filter(v => v.format === 'hls');
        if (hlsVersions.length > 0) {
          return { key: hlsVersions[0].key, format: 'hls' };
        }
      }
      
      // For other formats, select resolution based on bandwidth
      const matchingFormatVersions = asset.optimizedVersions.filter(v => v.format === bestFormat);
      if (matchingFormatVersions.length === 0) {
        return { key: asset.originalKey, format: asset.mimeType.split('/')[1] };
      }
      
      // Calculate target height based on bandwidth
      let targetHeight = 360; // Default to lowest quality
      
      if (clientCapabilities.bandwidth > 5000000) { // 5 Mbps
        targetHeight = 1080;
      } else if (clientCapabilities.bandwidth > 2500000) { // 2.5 Mbps
        targetHeight = 720;
      } else if (clientCapabilities.bandwidth > 1000000) { // 1 Mbps
        targetHeight = 480;
      }
      
      // Find the closest resolution match
      const bestVersionForResolution = matchingFormatVersions.reduce((best, current) => {
        const bestHeight = best.key.includes('p') 
          ? parseInt(best.key.split('p')[0].split('/').pop() || '0') 
          : 0;
        const currentHeight = current.key.includes('p')
          ? parseInt(current.key.split('p')[0].split('/').pop() || '0')
          : 0;
        
        const bestDiff = Math.abs(bestHeight - targetHeight);
        const currentDiff = Math.abs(currentHeight - targetHeight);
        
        return currentDiff < bestDiff ? current : best;
      });
      
      return { key: bestVersionForResolution.key, format: bestFormat };
    }
    
    // For other asset types
    return { key: asset.originalKey, format: asset.mimeType.split('/')[1] };
  }

  /**
   * Helper to calculate image sizes for responsive images
   */
  private getImageSizes(originalWidth: number, maxWidth: number): number[] {
    const breakpoints = [320, 640, 1024, 1440, 1920];
    return breakpoints
      .filter(width => width <= Math.min(originalWidth, maxWidth))
      .concat(Math.min(originalWidth, maxWidth));
  }

  /**
   * Helper to calculate video resolutions
   */
  private getVideoResolutions(originalHeight: number): number[] {
    const resolutions = [360, 480, 720, 1080];
    return resolutions.filter(height => height <= originalHeight);
  }

  /**
   * Helper to save buffer to temp file
   */
  private async saveTempFile(buffer: Buffer): Promise<string> {
    const tempDir = os.tmpdir();
    const tempFilePath = path.join(
      tempDir,
      `cdn-temp-${crypto.randomBytes(6).toString('hex')}`
    );
    
    return new Promise((resolve, reject) => {
      fs.writeFile(tempFilePath, buffer, err => {
        if (err) reject(err);
        else resolve(tempFilePath);
      });
    });
  }
}
