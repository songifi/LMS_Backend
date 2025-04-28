import { Injectable } from '@nestjs/common';

@Injectable()
export class MilestoneService {
  getMilestones() {
    return { message: 'Student milestones here' };
  }
}
