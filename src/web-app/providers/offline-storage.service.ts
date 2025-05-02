import { Injectable } from '@angular/core';
import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface LMSDatabase extends DBSchema {
  'courses': {
    key: number;
    value: {
      id: number;
      title: string;
      description: string;
      lastUpdated: string;
    };
  };
  'materials': {
    key: number;
    value: {
      id: number;
      courseId: number;
      title: string;
      content: string;
      type: string;
      size: number;
      lastAccessed: string;
    };
    indexes: { 'by-course': number };
  };
  'assignments': {
    key: number;
    value: {
      id: number;
      courseId: number;
      title: string;
      instructions: string;
      dueDate: string;
      status: 'pending' | 'submitted' | 'graded';
    };
    indexes: { 'by-course': number; 'by-status': string };
  };
  'submissions': {
    key: number;
    value: {
      id?: number;
      assignmentId: number;
      content: string;
      files: Array<{name: string, data: Blob}>;
      timestamp: string;
      synced: boolean;
    };
    indexes: { 'by-assignment': number; 'by-synced': boolean };
  };
  'user-progress': {
    key: number;
    value: {
      materialId: number;
      userId: number;
      progress: number;
      lastPosition: string;
    };
  };
}

@Injectable({
  providedIn: 'root'
})
export class OfflineStorageService {
  private db: IDBPDatabase<LMSDatabase>;
  private storageQuota = 50 * 1024 * 1024; // Default 50MB quota
  
  constructor() {
    this.initDatabase();
  }
  
  private async initDatabase() {
    try {
      // Check available storage
      if (navigator.storage && navigator.storage.estimate) {
        const estimate = await navigator.storage.estimate();
        const percentUsed = (estimate.usage / estimate.quota) * 100;
        console.log(`Storage usage: ${percentUsed.toFixed(2)}% of quota`);
        this.storageQuota = Math.min(estimate.quota * 0.8, 100 * 1024 * 1024); // Use 80% of available or max 100MB
      }
      
      this.db = await openDB<LMSDatabase>('lms-offline-db', 1, {
        upgrade(db) {
          // Create object stores
          const courseStore = db.createObjectStore('courses', { keyPath: 'id' });
          
          const materialsStore = db.createObjectStore('materials', { keyPath: 'id' });
          materialsStore.createIndex('by-course', 'courseId');
          
          const assignmentsStore = db.createObjectStore('assignments', { keyPath: 'id' });
          assignmentsStore.createIndex('by-course', 'courseId');
          assignmentsStore.createIndex('by-status', 'status');
          
          const submissionsStore = db.createObjectStore('submissions', { 
            keyPath: 'id', 
            autoIncrement: true 
          });
          submissionsStore.createIndex('by-assignment', 'assignmentId');
          submissionsStore.createIndex('by-synced', 'synced');
          
          db.createObjectStore('user-progress', { 
            keyPath: ['materialId', 'userId'] 
          });
        }
      });
      
      console.log('Offline database initialized');
    } catch (error) {
      console.error('Failed to initialize database', error);
    }
  }
  
  // Store course data for offline access
  async storeCourse(course) {
    if (!this.db) await this.initDatabase();
    return this.db.put('courses', {
      ...course,
      lastUpdated: new Date().toISOString()
    });
  }
  
  // Store course material with content
  async storeMaterial(material) {
    if (!this.db) await this.initDatabase();
    
    // Check material size against quota
    const materialSize = this.estimateSize(material);
    
    // If material is too large, store metadata only
    if (materialSize > this.storageQuota * 0.2) { // Don't let a single material use more than 20% of quota
      console.warn('Material too large for complete offline storage, storing metadata only');
      return this.db.put('materials', {
        ...material,
        content: null, // Don't store content
        size: materialSize,
        partial: true,
        lastAccessed: new Date().toISOString()
      });
    }
    
    return this.db.put('materials', {
      ...material,
      size: materialSize,
      partial: false,
      lastAccessed: new Date().toISOString()
    });
  }
  
  // Get all available offline courses
  async getOfflineCourses() {
    if (!this.db) await this.initDatabase();
    return this.db.getAll('courses');
  }
  
  // Get materials for a specific course
  async getMaterialsByCourse(courseId) {
    if (!this.db) await this.initDatabase();
    return this.db.getAllFromIndex('materials', 'by-course', courseId);
  }
  
  // Store assignment submission for syncing later
  async storeSubmission(submission) {
    if (!this.db) await this.initDatabase();
    submission.timestamp = new Date().toISOString();
    submission.synced = false;
    return this.db.add('submissions', submission);
  }
  
  // Get all pending submissions that need to be synced
  async getPendingSubmissions() {
    if (!this.db) await this.initDatabase();
    return this.db.getAllFromIndex('submissions', 'by-synced', false);
  }
  
  // Mark submission as synced
  async markSubmissionSynced(id) {
    if (!this.db) await this.initDatabase();
    const submission = await this.db.get('submissions', id);
    if (submission) {
      submission.synced = true;
      return this.db.put('submissions', submission);
    }
  }
  
  // Update user progress for a material
  async updateProgress(materialId, userId, progress, position) {
    if (!this.db) await this.initDatabase();
    return this.db.put('user-progress', {
      materialId,
      userId,
      progress,
      lastPosition: position,
    });
  }
  
  // Cleanup old or unused content to free up space
  async performStorageCleanup() {
    if (!this.db) await this.initDatabase();
    
    try {
      // Get storage estimate
      const estimate = await navigator.storage.estimate();
      const percentUsed = (estimate.usage / estimate.quota) * 100;
      
      // If we're using more than 80% of quota, clean up
      if (percentUsed > 80) {
        console.log('Storage usage high, cleaning up old content');
        
        // Get all materials ordered by last accessed
        const materials = await this.db.getAll('materials');
        materials.sort((a, b) => 
          new Date(a.lastAccessed).getTime() - new Date(b.lastAccessed).getTime()
        );
        
        // Remove oldest materials until we're below 60% usage
        let currentUsage = estimate.usage;
        for (const material of materials) {
          if (percentUsed <= 60) break;
          
          // Skip already partial materials
          if (material.partial) continue;
          
          // Convert to partial by removing content
          material.content = null;
          material.partial = true;
          await this.db.put('materials', material);
          
          currentUsage -= material.size * 0.9; // Approximate content size
          percentUsed = (currentUsage / estimate.quota) * 100;
        }
      }
    } catch (error) {
      console.error('Error cleaning up storage', error);
    }
  }
  
  // Estimate size of an object in bytes
  private estimateSize(obj) {
    const jsonString = JSON.stringify(obj);
    // Approximate size in bytes (2 bytes per character in UTF-16)
    return jsonString.length * 2;
  }
}