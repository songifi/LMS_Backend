import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StudentPreferenceEntity } from './entities/student-preference.entity';
import { AssetEntity } from './entities/asset.entity';
import { CdnConfig } from './interfaces/cdn-config.interface';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class PreloadingService {
  constructor(
    @Inject('CDN_CONFIG')
    private readonly config: CdnConfig,
    @InjectRepository(StudentPreferenceEntity)
    private readonly studentPrefRepository: Repository<StudentPreferenceEntity>,
    @InjectRepository(AssetEntity)
    private readonly assetRepository: Repository<AssetEntity>,
  ) {}

  /**
   * Update student access pattern data for content preloading
   */
  async updateStudentAccessPattern(
    studentId: string, 
    assetId: string,
    courseId: string,
    moduleId: string,
  ): Promise<void> {
    // Skip if preloading is disabled
    if (!this.config.preloading.enabled) {
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
      });
    }

    // Update access time pattern
    const now = new Date();
    const dayOfWeek = now.getDay();
    const hourOfDay = now.getHours();
    
    const existingPattern = studentPref.accessPatterns.find(
      p => p.dayOfWeek === dayOfWeek && p.hourOfDay === hourOfDay
    );

    if (existingPattern) {
      existingPattern.frequency += 1;
    } else {
      studentPref.accessPatterns.push({
        dayOfWeek,
        hourOfDay,
        frequency: 1,
      });
    }

    // Update frequently accessed content
    const existingContent = studentPref.frequentlyAccessedContent.find(
      c => c.assetId === assetId
    );

    if (existingContent) {
      existingContent.count += 1;
      existingContent.lastAccessed = now;
    } else {
      studentPref.frequentlyAccessedContent.push({
        assetId,
        count: 1,
        lastAccessed: now,
      });
    }

    // Sort by count to keep the most accessed assets at the top
    studentPref.frequentlyAccessedContent.sort((a, b) => b.count - a.count);
    
    // Trim to max size
    if (studentPref.frequentlyAccessedContent.length > 100) {
      studentPref.frequentlyAccessedContent = 
        studentPref.frequentlyAccessedContent.slice(0, 100);
    }

    // Update course progress
    const existingCourse = studentPref.courseProgress.find(
      c => c.courseId === courseId && c.moduleId === moduleId
    );

    if (existingCourse) {
      existingCourse.lastAccessed = now;
    } else {
      studentPref.courseProgress.push({
        courseId,
        moduleId,
        progress: 0, // Initial progress
        lastAccessed: now,
      });
    }

    await this.studentPrefRepository.save(studentPref);
  }

  /**
   * Analyze course content and trigger preloading of assets
   */
  async analyzeAndPreload(courseId: string, moduleId: string): Promise<void> {
    // Skip if preloading is disabled
    if (!this.config.preloading.enabled) {
      return;
    }

    // Find all assets for this course module
    const assets = await this.assetRepository.find({
      where: { courseId, moduleId },
      order: { accessCount: 'DESC' },
      take: this.config.preloading.maxAssetsToPreload,
    });

    // In a real implementation, this would trigger preloading of assets to edge nodes
    console.log(`Preloading ${assets.length} assets for course ${courseId}, module ${moduleId}`);
    
    // Return early in this implementation
    return;
  }

  /**
   * Schedule-based preloading of popular content
   */
  @Cron('0 */4 * * *') // Run every 4 hours
  async scheduleBasedPreloading(): Promise<void> {
    // Skip if not enabled
    if (!this.config.preloading.enabled || !this.config.preloading.scheduleBasedPreloading) {
      return;
    }

    // Get current time
    const now = new Date();
    const dayOfWeek = now.getDay();
    const hourOfDay = now.getHours();
    const nextHourOfDay = (hourOfDay + 4) % 24; // Look ahead 4 hours

    // Find students who commonly access content at the upcoming hour
    const studentsWithPatterns = await this.studentPrefRepository.find({
      where: { 
        accessPatterns: { dayOfWeek, hourOfDay: nextHourOfDay },
      },
    });

    // For each student, preload their frequently accessed content
    for (const student of studentsWithPatterns) {
      const topAssets = student.frequentlyAccessedContent
        .slice(0, this.config.preloading.maxAssetsToPreload);

      if (topAssets.length > 0) {
        // Get the asset IDs
        const assetIds = topAssets.map(a => a.assetId);
        
        // In a real implementation, this would trigger preloading
        console.log(`Preloading ${assetIds.length} assets for student ${student.studentId} based on schedule`);
      }
    }
  }

  /**
   * Get next content recommendations for a student
   */
  async getNextContentRecommendations(
    studentId: string,
    courseId: string,
  ): Promise<string[]> {
    // Skip if user behavior analysis is disabled
    if (!this.config.preloading.userBehaviorAnalysis) {
      return [];
    }
    
    const studentPref = await this.studentPrefRepository.findOne({
      where: { studentId },
    });

    if (!studentPref) {
      return [];
    }

    // Find the current module in the course
    const courseProgress = studentPref.courseProgress.find(
      cp => cp.courseId === courseId
    );

    if (!courseProgress) {
      return [];
    }

    // Find assets in the next module
    // In a real implementation, we would have a course structure to determine the next module
    // For now, we'll just return frequently accessed assets
    const recommendations = studentPref.frequentlyAccessedContent
      .filter(fac => {
        const asset = this.assetRepository.findOne({ where: { id: fac.assetId } });
        return asset && asset.then(a => a?.courseId === courseId);
      })
      .map(fac => fac.assetId)
      .slice(0, 5);

    return recommendations;
  }
}
