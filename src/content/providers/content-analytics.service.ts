import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Content } from '../entities/content.entity';

// We would typically create a dedicated ContentView entity to track views
// For simplicity, we'll use a simple in-memory approach here

interface ContentViewRecord {
  contentId: string;
  userId: string;
  timestamp: Date;
}

@Injectable()
export class ContentAnalyticsService {
  private contentViews: ContentViewRecord[] = [];

  constructor(
    @InjectRepository(Content)
    private readonly contentRepository: Repository<Content>,
  ) {}

  async recordView(contentId: string, userId: string): Promise<void> {
    // Record the view
    this.contentViews.push({
      contentId,
      userId,
      timestamp: new Date(),
    });

    // Update view count in content
    await this.incrementViewCount(contentId);
  }

  private async incrementViewCount(contentId: string): Promise<void> {
    // Increment the view count in the content entity
    await this.contentRepository.increment({ id: contentId }, 'viewCount', 1);
  }

  async getContentAnalytics(contentId: string): Promise<{
    totalViews: number;
    uniqueViewers: number;
    viewsOverTime: { date: string; views: number }[];
  }> {
    // Get all views for this content
    const views = this.contentViews.filter(view => view.contentId === contentId);

    // Calculate total views
    const totalViews = views.length;

    // Calculate unique viewers
    const uniqueViewerIds = new Set(views.map(view => view.userId));
    const uniqueViewers = uniqueViewerIds.size;

    // Calculate views over time (last 30 days)
    const viewsOverTime = this.getViewsOverTime(views);

    return {
      totalViews,
      uniqueViewers,
      viewsOverTime,
    };
  }

  private getViewsOverTime(views: ContentViewRecord[]): { date: string; views: number }[] {
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Group views by date
    const viewsByDate = new Map<string, number>();

    // Initialize all dates in the last 30 days
    for (let i = 0; i < 30; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateString = this.formatDate(date);
      viewsByDate.set(dateString, 0);
    }

    // Count views for each date
    views.forEach(view => {
      if (view.timestamp >= thirtyDaysAgo) {
        const dateString = this.formatDate(view.timestamp);
        const currentCount = viewsByDate.get(dateString) || 0;
        viewsByDate.set(dateString, currentCount + 1);
      }
    });

    // Convert map to array of objects
    return Array.from(viewsByDate.entries())
      .map(([date, views]) => ({ date, views }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}