import { Injectable } from '@nestjs/common';

@Injectable()
export class GoalService {
  createGoal(dto: any) {
    return { message: 'Goal created', dto };
  }

  getGoals() {
    return { message: 'Student goals here' };
  }
}
