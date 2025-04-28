import { Injectable } from '@nestjs/common';

@Injectable()
export class ProgressService {
  getProgressOverview() {
    return { message: 'Progress overview here' };
  }

  getCourseProgress() {
    return { message: 'Course progress here' };
  }

  getProgramProgress() {
    return { message: 'Program progress here' };
  }
}
