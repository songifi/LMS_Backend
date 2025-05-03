import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StudentPreferenceEntity } from './entities/student-preference.entity';
import { CdnConfig } from './interfaces/cdn-config.interface';

@Injectable()
export class BandwidthDetectionService {
  constructor(
    @Inject('CDN_CONFIG')
    private readonly config: CdnConfig,
    @InjectRepository(StudentPreferenceEntity)
    private readonly studentPrefRepository: Repository<StudentPreferenceEntity>,
  ) {}

  /**
   * Detect client capabilities based on user agent and connection info
   */
  async detectClientCapabilities(
    userAgent: string,
    connectionType?: string,
    studentId?: string,
  ): Promise<{
    supportedFormats: string[];
    bandwidth: number;
    screenWidth: number;
    devicePixelRatio: number;
  }> {
    // Default values
    let result = {
      supportedFormats: ['jpeg', 'png', 'webp', 'mp4'],
      bandwidth: 1000000, // 1 Mbps default
      screenWidth: 1280,
      devicePixelRatio: 1,
    };
    
    // Update based on user agent
    if (userAgent) {
      // Check for WebP support
      if (userAgent.includes('Chrome/') || userAgent.includes('Opera/')) {
        result.supportedFormats.push('webp');
      }
      
      // Check for AVIF support (newer browsers)
      if (
        (userAgent.includes('Chrome/') && parseInt(userAgent.split('Chrome/')[1]) >= 85) ||
        (userAgent.includes('Firefox/') && parseInt(userAgent.split('Firefox/')[1]) >= 86)
      ) {
        result.supportedFormats.push('avif');
      }
      
      // Check for HLS support
      if (
        userAgent.includes('Safari/') || 
        userAgent.includes('Chrome/') || 
        userAgent.includes('Firefox/')
      ) {
        result.supportedFormats.push('hls');
      }
      
      // Detect device
      if (userAgent.includes('Mobile')) {
        result.screenWidth = 640;
        result.bandwidth = 500000; // 500 Kbps for mobile default
      } else if (userAgent.includes('Tablet')) {
        result.screenWidth = 1024;
        result.bandwidth = 800000; // 800 Kbps for tablet default
      }
      
      // Detect high-DPI devices
      if (userAgent.includes('Retina') || userAgent.includes('iPhone')) {
        result.devicePixelRatio = 2;
      }
    }
    
    // Update based on connection type
    if (connectionType) {
      switch (connectionType.toLowerCase()) {
        case '4g':
          result.bandwidth = 2000000; // 2 Mbps
          break;
        case '3g':
          result.bandwidth = 500000; // 500 Kbps
          break;
        case '2g':
          result.bandwidth = 100000; // 100 Kbps
          break;
        case 'wifi':
          result.bandwidth = 5000000; // 5 Mbps
          break;
        case 'ethernet':
          result.bandwidth = 10000000; // 10 Mbps
          break;
      }
    }
    
    // If studentId is provided, check for stored preferences
    if (studentId) {
      const studentPref = await this.studentPrefRepository.findOne({
        where: { studentId },
      });
      
      if (studentPref && studentPref.deviceInfo && studentPref.deviceInfo.averageBandwidth) {
        // Use the stored bandwidth as it's likely more accurate over time
        result.bandwidth = studentPref.deviceInfo.averageBandwidth;
      }
    }
    
    return result;
  }

  /**
   * Update student bandwidth metrics
   */
  async updateBandwidthMetrics(
    studentId: string,
    bandwidth: number,
    latency: number,
  ): Promise<void> {
    if (!studentId) {
      return;
    }
    
    let studentPref = await this.studentPrefRepository.findOne({
      where: { studentId },
    });
    
    if (!studentPref) {
      studentPref = this.studentPrefRepository.create({
        studentId,
        accessPatterns: [],
        frequentlyAccessedContent: [],
        courseProgress: [],
        deviceInfo: {},
      });
    }
    
    if (!studentPref.deviceInfo) {
      studentPref.deviceInfo = {};
    }
    
    // Update with exponential moving average
    const alpha = 0.3; // Weight for new measurement
    
    if (studentPref.deviceInfo.averageBandwidth) {
      studentPref.deviceInfo.averageBandwidth = 
        alpha * bandwidth + (1 - alpha) * studentPref.deviceInfo.averageBandwidth;
    } else {
      studentPref.deviceInfo.averageBandwidth = bandwidth;
    }
    
    await this.studentPrefRepository.save(studentPref);
  }
}
