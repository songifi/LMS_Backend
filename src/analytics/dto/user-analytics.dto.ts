import { ApiProperty } from '@nestjs/swagger';

export class UserAnalyticsDto {
  @ApiProperty({ description: 'Unique identifier for the user' })
  userId: string;

  @ApiProperty({ description: 'Total number of courses enrolled' })
  enrolledCourses: number;

  @ApiProperty({ description: 'Total number of completed courses' })
  completedCourses: number;

  @ApiProperty({ description: 'Average score across all courses' })
  avgScore: number;

  @ApiProperty({ description: 'Total time spent on platform in minutes' })
  totalTimeSpent: number;

  @ApiProperty({ description: 'Average session duration in minutes' })
  avgSessionDuration: number;

  @ApiProperty({ description: 'Activity over time' })
  activityTimeline: Array<{
    date: string;
    sessions: number;
    timeSpent: number;
    resourcesAccessed: number;
  }>;
}
