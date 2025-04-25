import { Injectable } from '@nestjs/common';
import { Submission } from '../entities/submission.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';

@Injectable()
export class PlagiarismService {
  constructor(
    @InjectRepository(Submission)
    private submissionRepository: Repository<Submission>,
  ) {}

  async checkPlagiarism(submission: Submission): Promise<number> {
    // Get all previous submissions for this assessment, excluding the current student's submission
    const previousSubmissions = await this.submissionRepository.find({
      where: {
        assessment: { id: submission.assessment.id },
        student: { id: Not(submission.student.id) }, // TypeORM's correct way to say "not equal"
      },
    });

    if (previousSubmissions.length === 0) {
      return 0; // No submissions to compare with
    }

    let totalSimilarity = 0;
    let comparisonCount = 0;

    for (const prevSubmission of previousSubmissions) {
      const similarity = this.calculateSimilarity(submission.answers, prevSubmission.answers);
      totalSimilarity += similarity;
      comparisonCount++;
    }

    // Return percentage of similarity (0-100)
    const plagiarismScore = comparisonCount > 0 ? (totalSimilarity / comparisonCount) * 100 : 0;
    return Math.min(100, Math.max(0, plagiarismScore));
  }

  private calculateSimilarity(answers1: any, answers2: any): number {
    // Basic similarity checking: compares string answers
    let matchCount = 0;
    let totalFields = 0;

    for (const key in answers1) {
      if (typeof answers1[key] === 'string' && typeof answers2[key] === 'string') {
        totalFields++;
        const text1 = answers1[key].toLowerCase().trim();
        const text2 = answers2[key].toLowerCase().trim();
        
        if (text1 === text2 && text1.length > 10) {
          matchCount += 1;
        } else if (text1.includes(text2) || text2.includes(text1)) {
          matchCount += 0.5;
        }
      }
    }

    return totalFields > 0 ? matchCount / totalFields : 0;
  }
}
