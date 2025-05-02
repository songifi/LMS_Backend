import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Assignment } from '../assignments/entities/assignment.entity';
import { Submission } from '../assignments/entities/submission.entity';
import { UserProgress } from '../user/entities/user-progress.entity';
import { Course } from '../courses/entities/course.entity';
import { Material } from '../materials/entities/material.entity';

@Injectable()
export class SyncService {
  constructor(
    @InjectRepository(Assignment)
    private assignmentsRepository: Repository<Assignment>,
    @InjectRepository(Submission)
    private submissionsRepository: Repository<Submission>,
    @InjectRepository(UserProgress)
    private userProgressRepository: Repository<UserProgress>,
    @InjectRepository(Course)
    private coursesRepository: Repository<Course>,
    @InjectRepository(Material)
    private materialsRepository: Repository<Material>,
  ) {}
  
  // Process assignment submissions from offline sync
  async processAssignmentSubmissions(submissions: any[], userId: number) {
    const results = [];
    
    for (const submission of submissions) {
      try {
        // Verify the assignment exists
        const assignment = await this.assignmentsRepository.findOne(submission.assignmentId);
        
        if (!assignment) {
          results.push({
            id: submission.id,
            status: 'error',
            message: 'Assignment not found'
          });
          continue;
        }
        
        // Check if already submitted
        const existingSubmission = await this.submissionsRepository.findOne({
          where: {
            assignment: { id: submission.assignmentId },
            user: { id: userId }
          }
        });
        
        if (existingSubmission) {
          // Update existing submission
          existingSubmission.content = submission.content;
          existingSubmission.updatedAt = new Date();
          
          await this.submissionsRepository.save(existingSubmission);
          
          results.push({
            id: submission.id,
            status: 'updated',
            message: 'Submission updated successfully'
          });
        } else {
          // Create new submission
          const newSubmission = this.submissionsRepository.create({
            content: submission.content,
            assignment: { id: submission.assignmentId },
            user: { id: userId },
            createdAt: new Date(submission.timestamp) || new Date(),
            updatedAt: new Date()
          });
          
          await this.submissionsRepository.save(newSubmission);
          
          results.push({
            id: submission.id,
            status: 'created',
            message: 'Submission created successfully'
          });
        }
      } catch (error) {
        results.push({
          id: submission.id,
          status: 'error',
          message: error.message
        });
      }
    }
    
    return {
      success: true,
      results
    };
  }
  
  // Process user progress updates from offline sync
  async processUserProgress(progressUpdates: any[], userId: number) {
    const results = [];
    
    for (const progress of progressUpdates) {
      try {
        // Find existing progress
        let userProgress = await this.userProgressRepository.findOne({
          where: {
            material: { id: progress.materialId },
            user: { id: userId }
          }
        });
        
        if (userProgress) {
          // Only update if the new progress is greater
          if (progress.progress > userProgress.progress) {
            userProgress.progress = progress.progress;
            userProgress.lastPosition = progress.lastPosition;
            userProgress.updatedAt = new Date();
            
            await this.userProgressRepository.save(userProgress);
          }
        } else {
          // Create new progress record
          userProgress = this.userProgressRepository.create({
            material: { id: progress.materialId },
            user: { id: userId },
            progress: progress.progress,
            lastPosition: progress.lastPosition,
            createdAt: new Date(),
            updatedAt: new Date()
          });
          
          await this.userProgressRepository.save(userProgress);
        }
        
        results.push({
          materialId: progress.materialId,
          status: 'success'
        });
      } catch (error) {
        results.push({
          materialId: progress.materialId,
          status: 'error',
          message: error.message
        });
      }
    }
    
    return {
      success: true,
      results
    };
  }
  
  // Get content changes since last sync
  async getContentChanges(lastSyncTimestamp: string) {
    const lastSync = new Date(lastSyncTimestamp);
    
    // Get updated courses
    const updatedCourses = await this.coursesRepository.find({
      where: {
        updatedAt: { $gt: lastSync }
      }
    });
    
    // Get updated materials
    const updatedMaterials = await this.materialsRepository.find({
      where: {
        updatedAt: { $gt: lastSync }
      }
    });
    
    return {
      timestamp: new Date().toISOString(),
      courses: updatedCourses.map(course => ({
        id: course.id,
        title: course.title,
        updatedAt: course.updatedAt
      })),
      materials: updatedMaterials.map(material => ({
        id: material.id,
        courseId: material.course.id,
        title: material.title,
        updatedAt: material.updatedAt
      }))
    };
  }
}