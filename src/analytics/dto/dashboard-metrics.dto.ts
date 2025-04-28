import { ApiProperty } from '@nestjs/swagger';

export class DashboardMetricsDto {
  @ApiProperty({ description: 'Total number of active users' })
  activeUsers: number;

  @ApiProperty({ description: 'Total number of courses' })
  totalCourses: number;

  @ApiProperty({ description: 'Average time spent per session in minutes' })
  avgSessionTime: number;

  @ApiProperty({ description: 'Average course completion rate as percentage' })
  avgCompletionRate: number;

  @ApiProperty({ description: 'Total number of assignments submitted' })
  totalSubmissions: number;

  @ApiProperty({ description: 'System usage over time' })
  systemUsage: Array<{
    date: string;
    users: number;
    sessions: number;
    avgDuration: number;
  }>;
}