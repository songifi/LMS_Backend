import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Leaderboard } from '../entities/leaderboard.entity';
import { LeaderboardDto, LeaderboardEntryDto } from '../dto/leaderboard.dto';

@Injectable()
export class LeaderboardService {
  constructor(
    @InjectRepository(Leaderboard)
    private leaderboardRepository: Repository<Leaderboard>,
    // In a real app, you would inject other services as needed
    // For example, to get user data:
    // private userService: UserService,
  ) {}

  async getLeaderboards(): Promise<LeaderboardDto[]> {
    const leaderboards = await this.leaderboardRepository.find();
    return leaderboards.map(lb => ({
      name: lb.name,
      period: lb.period,
      startDate: lb.startDate,
      endDate: lb.endDate,
      entries: lb.entries as LeaderboardEntryDto[],
    }));
  }

  async getLeaderboard(name: string): Promise<LeaderboardDto> {
    const leaderboard = await this.leaderboardRepository.findOne({ where: { name } });
    if (!leaderboard) {
      throw new Error(`Leaderboard ${name} not found`);
    }
    
    return {
      name: leaderboard.name,
      period: leaderboard.period,
      startDate: leaderboard.startDate,
      endDate: leaderboard.endDate,
      entries: leaderboard.entries as LeaderboardEntryDto[],
    };
  }

  async updateLeaderboard(name: string): Promise<LeaderboardDto> {
    // This is a simplified implementation
    // In a real app, you would:
    // 1. Query the database for user points during the leaderboard period
    // 2. Sort users by points
    // 3. Update the leaderboard entries with current rankings
    
    const leaderboard = await this.leaderboardRepository.findOne({ where: { name } });
    if (!leaderboard) {
      throw new Error(`Leaderboard ${name} not found`);
    }
    
    // Mock: Update leaderboard with random data
    const mockEntries: LeaderboardEntryDto[] = Array.from({ length: 10 }, (_, i) => ({
      userId: i + 1,
      username: `User${i + 1}`,
      points: Math.floor(Math.random() * 1000),
      rank: 0, // Will be set after sorting
      profileImageUrl: `https://example.com/avatar${i + 1}.jpg`,
    }));
    
    // Sort by points and assign ranks
    mockEntries.sort((a, b) => b.points - a.points);
    mockEntries.forEach((entry, index) => {
      entry.rank = index + 1;
    });
    
    leaderboard.entries = mockEntries;
    leaderboard.updatedAt = new Date();
    
    await this.leaderboardRepository.save(leaderboard);
    
    return {
      name: leaderboard.name,
      period: leaderboard.period,
      startDate: leaderboard.startDate,
      endDate: leaderboard.endDate,
      entries: leaderboard.entries as LeaderboardEntryDto[],
    };
  }

  async createLeaderboard(leaderboardDto: LeaderboardDto): Promise<LeaderboardDto> {
    const leaderboard = this.leaderboardRepository.create({
      name: leaderboardDto.name,
      period: leaderboardDto.period,
      startDate: leaderboardDto.startDate,
      endDate: leaderboardDto.endDate,
      entries: leaderboardDto.entries || [],
    });
    
    await this.leaderboardRepository.save(leaderboard);
    
    return leaderboardDto;
  }
}