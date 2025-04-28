import { ApiProperty } from '@nestjs/swagger';

export class CourseAnalyticsDto {
  @ApiProperty({ description: 'Unique identifier for the course' })
  courseId: string;

  @ApiProperty({ description: 'Name of the course' })
  courseName: string;

  @ApiProperty({ description: 'Total number of students enrolled' })
  enrollment: number;

  @ApiProperty({ description: 'Average course completion percentage' })
  completionRate: number;

  @ApiProperty({ description: 'Average score on course assessments' })
  avgScore: number;

  @ApiProperty({ description: 'Average time spent on course in minutes' })
  avgTimeSpent: number;

  @ApiProperty({ description: 'Engagement metrics' })
  engagement: {
    discussions: number;
    resourceAccess: number;
    videoViews: number;
  };

  @ApiProperty({ description: 'Distribution of student scores' })
  scoreDistribution: Array<{
    range: string;
    count: number;
    percentage: number;
  }>;
}