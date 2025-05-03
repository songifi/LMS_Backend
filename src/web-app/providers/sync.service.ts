import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { OfflineStorageService } from './offline-storage.service';
import { fromEvent, merge, of, Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SyncService {
  private online$: Observable<boolean>;
  private syncInProgress = false;
  
  constructor(
    private http: HttpClient,
    private offlineStorage: OfflineStorageService
  ) {
    // Create an observable for online status
    this.online$ = merge(
      of(navigator.onLine),
      fromEvent(window, 'online').pipe(map(() => true)),
      fromEvent(window, 'offline').pipe(map(() => false))
    ).pipe(
      startWith(navigator.onLine)
    );
    
    // Subscribe to online status changes
    this.online$.subscribe(isOnline => {
      if (isOnline && !this.syncInProgress) {
        this.performSync();
      }
    });
    
    // Register for background sync if supported
    this.registerBackgroundSync();
  }
  
  // Register for background sync
  private async registerBackgroundSync() {
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      try {
        const registration = await navigator.serviceWorker.ready;
        
        // Register for background sync
        await registration.sync.register('sync-pending-requests');
        console.log('Background sync registered');
      } catch (error) {
        console.error('Background sync registration failed:', error);
      }
    } else {
      console.log('Background sync not supported');
    }
  }
  
  // Perform synchronization when online
  public async performSync() {
    if (!navigator.onLine || this.syncInProgress) return;
    
    this.syncInProgress = true;
    
    try {
      // 1. Sync pending assignment submissions
      await this.syncSubmissions();
      
      // 2. Sync user progress data
      await this.syncUserProgress();
      
      // 3. Update course content if needed
      await this.updateCourseContent();
      
      console.log('Synchronization completed');
    } catch (error) {
      console.error('Synchronization failed:', error);
    } finally {
      this.syncInProgress = false;
    }
  }
  
  // Sync pending assignment submissions
  private async syncSubmissions() {
    const pendingSubmissions = await this.offlineStorage.getPendingSubmissions();
    
    if (pendingSubmissions.length === 0) {
      console.log('No pending submissions to sync');
      return;
    }
    
    console.log(`Syncing ${pendingSubmissions.length} pending submissions`);
    
    for (const submission of pendingSubmissions) {
      try {
        // Create FormData for files if present
        const formData = new FormData();
        
        // Add submission content
        formData.append('content', submission.content);
        formData.append('assignmentId', submission.assignmentId.toString());
        formData.append('timestamp', submission.timestamp);
        
        // Add files if any
        if (submission.files && submission.files.length > 0) {
          submission.files.forEach((file, index) => {
            formData.append(`file-${index}`, file.data, file.name);
          });
        }
        
        // Send to server
        const response = await this.http.post('/api/assignments/submit', formData).toPromise();
        
        // If successful, mark as synced
        await this.offlineStorage.markSubmissionSynced(submission.id);
        console.log(`Submission ${submission.id} synced successfully`);
      } catch (error) {
        console.error(`Failed to sync submission ${submission.id}:`, error);
      }
    }
  }
  
  // Sync user progress data
  private async syncUserProgress() {
    // Implementation details...
  }
  
  // Update course content if new versions available
  private async updateCourseContent() {
    // Implementation details...
  }
  
  // Manually trigger sync (can be called from UI)
  public triggerSync() {
    if (navigator.onLine && !this.syncInProgress) {
      this.performSync();
      return true;
    }
    return false;
  }
  
  // Check if there are pending items to sync
  public async hasPendingSync(): Promise<boolean> {
    const pendingSubmissions = await this.offlineStorage.getPendingSubmissions();
    return pendingSubmissions.length > 0;
  }
  
  // Get online status as observable
  public getOnlineStatus(): Observable<boolean> {
    return this.online$;
  }
}