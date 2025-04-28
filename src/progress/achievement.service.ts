import { Injectable } from '@nestjs/common';

@Injectable()
export class AchievementService {
  getAchievements() {
    return { message: 'Student achievements here' };
  }
}
