import { Injectable } from '@nestjs/common';

@Injectable()
export class ProgressReportService {
  getReports() {
    return { message: 'Progress reports here' };
  }
}
