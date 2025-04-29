import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Badge } from '../entities/badge.entity';
import { BadgeDto, UserBadgeDto, UserBadgesResponseDto } from '../dto/badge.dto';

@Injectable()
export class BadgeService {
  constructor(
    @InjectRepository(Badge)
    private badgeRepository: Repository<Badge>,
  ) {}

  async createBadge(badgeDto: BadgeDto): Promise<Badge> {
    const badge = this.badgeRepository.create(badgeDto);
    return this.badgeRepository.save(badge);
  }

  async getBadges(): Promise<Badge[]> {
    return this.badgeRepository.find();
  }

  async getBadge(id: number): Promise<Badge> {
    const badge = await this.badgeRepository.findOne({ where: { id } });
    if (!badge) {
      throw new Error(`Badge with ID ${id} not found`);
    }
    return badge;
  }
  

  async getUserBadges(userId: number): Promise<UserBadgesResponseDto> {
    // This is a simplified implementation.
    // In a real application, you'd have a user-badge relationship table
    // to track which badges each user has earned and when.
    
    // For this example, we'll return a mock response
    const allBadges = await this.getBadges();
    
    // In a real implementation, filter badges based on user's achievements
    // Here we'll assume the user has earned some subset of badges
    const userBadges: UserBadgeDto[] = allBadges
      .filter((_, index) => index % 3 === 0) // Mock: user has every third badge
      .map(badge => ({
        badge: {
          name: badge.name,
          description: badge.description,
          imageUrl: badge.imageUrl,
          type: badge.type,
          requirements: badge.requirements,
          pointsValue: badge.pointsValue,
        },
        earnedAt: new Date(Date.now() - Math.random() * 10000000000), // Random date in the past
      }));

    return {
      userId,
      badges: userBadges,
      totalBadges: userBadges.length,
    };
  }

  async checkBadgeEligibility(userId: number, activityType: string, activityData: any): Promise<Badge[]> {
    // This method would check if the user has met requirements for any badges
    // For demo purposes, we'll just return an empty array
    return [];
  }

  async awardBadge(userId: number, badgeId: number): Promise<UserBadgeDto> {
    const badge = await this.getBadge(badgeId);
    if (!badge) {
      throw new Error('Badge not found');
    }
    
    // In a real app, record that the user earned this badge
    return {
      badge: {
        name: badge.name,
        description: badge.description,
        imageUrl: badge.imageUrl,
        type: badge.type,
        requirements: badge.requirements,
        pointsValue: badge.pointsValue,
      },
      earnedAt: new Date(),
    };
  }
}