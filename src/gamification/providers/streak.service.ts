import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActivityStreak } from '../entities/activity-streak.entity';
import { StreakDto } from '../dto/streak.dto';

@Injectable()
export class StreakService {
  constructor(
    @InjectRepository(ActivityStreak)
    private streakRepository: Repository<ActivityStreak>,
  ) {}

  async getStreak(userId: number): Promise<ActivityStreak> {
    const streak = await this.streakRepository.findOne({ where: { userId } });
    if (!streak) {
      // Create a new streak record for this user
      const newStreak = this.streakRepository.create({
        userId,
        currentStreak: 0,
        longestStreak: 0,
        lastActivityDate: new Date(0), // Set to epoch start
        activityTypes: [],
      });
      return this.streakRepository.save(newStreak);
    }
    return streak;
  }

  async updateStreak(userId: number, activityType?: string): Promise<ActivityStreak> {
    let streak = await this.getStreak(userId);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Get the date of the user's last activity
    const lastActivityDate = new Date(streak.lastActivityDate);
    const lastActivityDay = new Date(
      lastActivityDate.getFullYear(),
      lastActivityDate.getMonth(),
      lastActivityDate.getDate()
    );
    
    // If this is the first activity today
    if (lastActivityDay < today) {
      // Check if the streak is broken (more than 1 day since last activity)
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (lastActivityDay.getTime() === yesterday.getTime()) {
        // Consecutive day - increment streak
        streak.currentStreak++;
        // Update longest streak if current streak is longer
        if (streak.currentStreak > streak.longestStreak) {
          streak.longestStreak = streak.currentStreak;
        }
      } else if (lastActivityDay.getTime() !== 0) { // Skip this check for new users
        // Streak broken - reset to 1
        streak.currentStreak = 1;
      } else {
        // First activity ever - set to 1
        streak.currentStreak = 1;
      }
      
      // Update last activity date
      streak.lastActivityDate = now;
      
      // Add activity type to tracked activities if not already included
      if (activityType && !streak.activityTypes.includes(activityType)) {
        streak.activityTypes.push(activityType);
      }
      
      return this.streakRepository.save(streak);
    }
    
    // Already logged activity today - just update activity types if needed
    if (activityType && !streak.activityTypes.includes(activityType)) {
      streak.activityTypes.push(activityType);
      return this.streakRepository.save(streak);
    }
    
    return streak;
  }

  async getUserStreaks(userId: number): Promise<StreakDto> {
    const streak = await this.getStreak(userId);
    
    return {
      userId: streak.userId,
      currentStreak: streak.currentStreak,
      longestStreak: streak.longestStreak,
      lastActivityDate: streak.lastActivityDate,
      activityTypes: streak.activityTypes,
      metadata: streak.metadata,
    };
  }
}
