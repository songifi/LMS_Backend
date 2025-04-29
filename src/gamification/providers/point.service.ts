import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Point } from '../entities/point.entity';
import { PointDto, UserPointsDto } from '../dto/point.dto';
import { ActivityType } from '../interfaces/gamification.interfaces';
import { EngagementRuleService } from './engagement-rule.service';
import { StreakService } from './streak.service';

@Injectable()
export class PointService {
  constructor(
    @InjectRepository(Point)
    private pointRepository: Repository<Point>,
    private engagementRuleService: EngagementRuleService,
    private streakService: StreakService,
  ) {}

  async awardPoints(pointDto: PointDto): Promise<Point> {
    // Update activity streak
    await this.streakService.updateStreak(pointDto.userId);

    // Calculate points based on engagement rules
    const calculatedPoints = await this.calculatePoints(
      pointDto.userId,
      pointDto.activityType as ActivityType,
      pointDto.activityId,
      pointDto.metadata,
    );

    const point = this.pointRepository.create({
      userId: pointDto.userId,
      amount: calculatedPoints,
      activityType: pointDto.activityType,
      activityId: pointDto.activityId,
      metadata: pointDto.metadata,
    });

    return this.pointRepository.save(point);
  }

  async calculatePoints(
    userId: number, 
    activityType: ActivityType, 
    activityId?: number, 
    metadata?: Record<string, any>
  ): Promise<number> {
    // Get the rule for this activity type
    const rule = await this.engagementRuleService.getRuleForActivity(activityType);
    if (!rule) {
      return 0;
    }

    // Check if the user has reached their daily limit
    if (rule.dailyLimit > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const dailyPoints = await this.pointRepository.count({
        where: {
          userId,
          activityType,
          createdAt: Between(today, tomorrow),
        },
      });

      if (dailyPoints >= rule.dailyLimit) {
        return 0;
      }
    }

    // Get streak multiplier
    const streak = await this.streakService.getStreak(userId);
    const streakMultiplier = streak && streak.currentStreak > 1 ? 
      Math.min(1 + (streak.currentStreak * 0.1), 2) : // 10% per day, max 2x
      1;

    // Calculate final points
    let finalPoints = rule.basePoints * rule.multiplier * streakMultiplier;
    
    // Apply any additional calculation rules from the rule configuration
    if (rule.calculationRules) {
      // Custom logic based on calculationRules could be implemented here
      // For example: bonuses for specific content, time-based modifiers, etc.
    }

    return Math.round(Math.min(finalPoints, rule.maxPoints > 0 ? rule.maxPoints : finalPoints));
  }

  async getUserPoints(userId: number): Promise<UserPointsDto> {
    // Get all points for the user
    const points = await this.pointRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });

    // Calculate total points
    const totalPoints = points.reduce((sum, point) => sum + point.amount, 0);

    // Calculate daily points
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dailyPoints = points
      .filter(point => point.createdAt >= today)
      .reduce((sum, point) => sum + point.amount, 0);

    // Calculate weekly points
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);
    const weeklyPoints = points
      .filter(point => point.createdAt >= weekStart)
      .reduce((sum, point) => sum + point.amount, 0);

    // Calculate monthly points
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    const monthlyPoints = points
      .filter(point => point.createdAt >= monthStart)
      .reduce((sum, point) => sum + point.amount, 0);

    return {
      userId,
      totalPoints,
      dailyPoints,
      weeklyPoints,
      monthlyPoints,
      history: points.map(point => ({
        userId: point.userId,
        amount: point.amount,
        activityType: point.activityType,
        activityId: point.activityId,
        metadata: point.metadata,
      })),
    };
  }
}
