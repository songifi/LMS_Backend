import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { AnalyticsDatapoint } from '../entities/analytics-datapoint.entity';
import { DashboardMetricsDto } from '../dto/dashboard-metrics.dto';
import { CourseAnalyticsDto } from '../dto/course-analytics.dto';
import { UserAnalyticsDto } from '../dto/user-analytics.dto';
import { AnalyticsMetric } from '../entities/analytics.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(AnalyticsMetric)
    private metricsRepository: Repository<AnalyticsMetric>,
    @InjectRepository(AnalyticsDatapoint)
    private datapointsRepository: Repository<AnalyticsDatapoint>,
  ) {}

  async getDashboardMetrics(startDate?: string, endDate?: string): Promise<DashboardMetricsDto> {
    const dateCondition = this.getDateFilter(startDate, endDate);

    const activeUsers = await this.datapointsRepository.count({
      where: { metric: { name: 'active_users' }, ...dateCondition },
    });

    const totalCourses = await this.datapointsRepository.count({
      where: { metric: { name: 'total_courses' }, ...dateCondition },
    });

    const totalSessions = await this.datapointsRepository.count({
      where: { metric: { name: 'session' }, ...dateCondition },
    });

    const totalSubmissions = await this.datapointsRepository.count({
      where: { metric: { name: 'submissions' }, ...dateCondition },
    });

    const avgSessionTimeResult = await this.datapointsRepository
      .createQueryBuilder('datapoint')
      .select('AVG(datapoint.value)', 'avg')
      .innerJoin('datapoint.metric', 'metric')
      .where('metric.name = :name', { name: 'session_duration' })
      .andWhere(this.getDateFilterRaw('datapoint', startDate, endDate))
      .getRawOne();

    const avgCompletionRateResult = await this.datapointsRepository
      .createQueryBuilder('datapoint')
      .select('AVG(datapoint.value)', 'avg')
      .innerJoin('datapoint.metric', 'metric')
      .where('metric.name = :name', { name: 'completion_rate' })
      .andWhere(this.getDateFilterRaw('datapoint', startDate, endDate))
      .getRawOne();

    const systemUsage = await this.getSystemUsageData(startDate, endDate);

    return {
      activeUsers,
      totalCourses,
      avgSessionTime: parseFloat(avgSessionTimeResult?.avg ?? '0'),
      avgCompletionRate: parseFloat(avgCompletionRateResult?.avg ?? '0'),
      totalSubmissions,
      systemUsage,
    };
  }

  private async getSystemUsageData(startDate?: string, endDate?: string): Promise<any[]> {
    const qb = this.datapointsRepository
      .createQueryBuilder('datapoint')
      .select([
        "DATE(datapoint.createdAt) as date",
        "SUM(CASE WHEN metric.name = 'active_users' THEN datapoint.value ELSE 0 END) as users",
        "SUM(CASE WHEN metric.name = 'session' THEN datapoint.value ELSE 0 END) as sessions",
        "AVG(CASE WHEN metric.name = 'session_duration' THEN datapoint.value ELSE NULL END) as avgDuration",
      ])
      .innerJoin('datapoint.metric', 'metric');

    if (startDate && endDate) {
      qb.where('datapoint.createdAt BETWEEN :start AND :end', { start: startDate, end: endDate });
    }

    const data = await qb.groupBy('date').orderBy('date', 'ASC').getRawMany();

    return data.map(row => ({
      date: row.date,
      users: Number(row.users),
      sessions: Number(row.sessions),
      avgDuration: parseFloat(row.avgDuration),
    }));
  }

  async getCoursesAnalytics(startDate?: string, endDate?: string): Promise<CourseAnalyticsDto[]> {
    const metrics = await this.datapointsRepository.find({
      relations: ['metric'],
      where: {
        metric: { entityType: 'course' },
        ...this.getDateFilter(startDate, endDate),
      },
    });

    const grouped = this.groupBy(metrics, 'entityId');

    return Promise.all(Object.keys(grouped).map(async (courseId) => {
      const courseMetrics = grouped[courseId];

      return {
        courseId,
        courseName: `Course ${courseId}`,
        enrollment: this.sumMetric(courseMetrics, 'enrollment'),
        completionRate: this.avgMetric(courseMetrics, 'completion_rate'),
        avgScore: this.avgMetric(courseMetrics, 'avg_score'),
        avgTimeSpent: this.avgMetric(courseMetrics, 'time_spent'),
        engagement: {
          discussions: this.sumMetric(courseMetrics, 'discussions'),
          resourceAccess: this.sumMetric(courseMetrics, 'resource_access'),
          videoViews: this.sumMetric(courseMetrics, 'video_views'),
        },
        scoreDistribution: [],
      };
    }));
  }

  async getUsersAnalytics(startDate?: string, endDate?: string): Promise<UserAnalyticsDto[]> {
    const metrics = await this.datapointsRepository.find({
      relations: ['metric'],
      where: {
        metric: { entityType: 'user' },
        ...this.getDateFilter(startDate, endDate),
      },
    });

    const grouped = this.groupBy(metrics, 'entityId');

    return Promise.all(Object.keys(grouped).map(async (userId) => {
      const userMetrics = grouped[userId];

      return {
        userId,
        enrolledCourses: this.sumMetric(userMetrics, 'enrolled_courses'),
        completedCourses: this.sumMetric(userMetrics, 'completed_courses'),
        avgScore: this.avgMetric(userMetrics, 'avg_score'),
        totalTimeSpent: this.sumMetric(userMetrics, 'time_spent'),
        avgSessionDuration: this.avgMetric(userMetrics, 'session_duration'),
        activityTimeline: await this.getUserActivityTimeline(userId, startDate, endDate),
      };
    }));
  }

  private async getUserActivityTimeline(userId: string, startDate?: string, endDate?: string) {
    const qb = this.datapointsRepository
      .createQueryBuilder('datapoint')
      .select([
        "DATE(datapoint.createdAt) as date",
        "SUM(CASE WHEN metric.name = 'session' THEN datapoint.value ELSE 0 END) as sessions",
        "SUM(CASE WHEN metric.name = 'time_spent' THEN datapoint.value ELSE 0 END) as timeSpent",
        "SUM(CASE WHEN metric.name = 'resource_access' THEN datapoint.value ELSE 0 END) as resourcesAccessed",
      ])
      .innerJoin('datapoint.metric', 'metric')
      .where('datapoint.entityId = :userId', { userId });

    if (startDate && endDate) {
      qb.andWhere('datapoint.createdAt BETWEEN :start AND :end', { start: startDate, end: endDate });
    }

    const data = await qb.groupBy('date').orderBy('date', 'ASC').getRawMany();

    return data.map(row => ({
      date: row.date,
      sessions: Number(row.sessions),
      timeSpent: Number(row.timeSpent),
      resourcesAccessed: Number(row.resourcesAccessed),
    }));
  }

  async recordMetric(entityType: string, entityId: string, metricName: string, value: number, metadata?: Record<string, any>): Promise<AnalyticsDatapoint> {
    let metric = await this.metricsRepository.findOne({ where: { name: metricName, entityType } });

    if (!metric) {
      metric = await this.metricsRepository.save(this.metricsRepository.create({
        name: metricName,
        description: `Metric for ${metricName}`,
        unit: 'count',
        entityType,
      }));
    }

    const datapoint = this.datapointsRepository.create({
      metric,
      entityId,
      value,
      metadata,
    });

    return this.datapointsRepository.save(datapoint);
  }

  private groupBy(array: any[], key: string) {
    return array.reduce((result, currentItem) => {
      (result[currentItem[key]] = result[currentItem[key]] || []).push(currentItem);
      return result;
    }, {});
  }

  private sumMetric(metrics: AnalyticsDatapoint[], metricName: string) {
    return metrics
      .filter(m => m.metric.name === metricName)
      .reduce((sum, m) => sum + Number(m.value), 0);
  }

  private avgMetric(metrics: AnalyticsDatapoint[], metricName: string) {
    const filtered = metrics.filter(m => m.metric.name === metricName);
    if (!filtered.length) return 0;
    const total = filtered.reduce((sum, m) => sum + Number(m.value), 0);
    return total / filtered.length;
  }

  private getDateFilter(startDate?: string, endDate?: string) {
    if (startDate && endDate) {
      return { createdAt: Between(new Date(startDate), new Date(endDate)) };
    }
    return {};
  }

  private getDateFilterRaw(alias: string, startDate?: string, endDate?: string) {
    if (startDate && endDate) {
      return `${alias}.createdAt BETWEEN :start AND :end`;
    }
    return '1=1';
  }

  
}
