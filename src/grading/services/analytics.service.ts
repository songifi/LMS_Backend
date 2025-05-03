import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Submission } from '../entities/submission.entity';
import { GradingHistory } from '../entities/grading-history.entity';
import { Assignment } from '../entities/assignment.entity';
import { Rubric } from '../entities/rubric.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Assignment)
    private assignmentsRepository: Repository<Assignment>,
    @InjectRepository(Rubric)
    private rubricsRepository: Repository<Rubric>,
    @InjectRepository(GradingHistory)
    private gradingHistoryRepository: Repository<GradingHistory>,
  ) {}

  /**
   * Generates analytics for an assignment's grading
   */
  async generateAnalytics(assignmentId: string, gradedSubmissions: Submission[]): Promise<any> {
    // Get assignment with rubric
    const assignment = await this.assignmentsRepository.findOne({
      where: { id: assignmentId },
      relations: ['rubric', 'rubric.criteria'],
    });
    
    if (!assignment || gradedSubmissions.length === 0) {
      return {
        assignmentId,
        totalGraded: 0,
        analytics: {
          gradeDistribution: [],
          criteriaAnalysis: [],
          gradingConsistency: null,
          gradingTime: null,
        },
      };
    }
    
    // Calculate grade distribution
    const gradeDistribution = this.calculateGradeDistribution(gradedSubmissions);
    
    // Analyze performance by criteria
    const criteriaAnalysis = this.analyzeCriteria(gradedSubmissions, assignment.rubric);
    
    // Calculate grading consistency
    const gradingConsistency = await this.calculateGradingConsistency(assignmentId);
    
    // Calculate grading time analytics
    const gradingTime = await this.calculateGradingTime(assignmentId);
    
    return {
      assignmentId,
      title: assignment.title,
      totalGraded: gradedSubmissions.length,
      analytics: {
        gradeDistribution,
        criteriaAnalysis,
        gradingConsistency,
        gradingTime,
      },
    };
  }

  /**
   * Calculates grade distribution across different ranges
   */
  private calculateGradeDistribution(submissions: Submission[]): any {
    // Define grade ranges
    const ranges = [
      { min: 90, max: 100, label: '90-100%' },
      { min: 80, max: 89, label: '80-89%' },
      { min: 70, max: 79, label: '70-79%' },
      { min: 60, max: 69, label: '60-69%' },
      { min: 0, max: 59, label: '0-59%' },
    ];
    
    // Initialize counts
    const distribution = ranges.map(range => ({
      label: range.label,
      count: 0,
      percentage: 0,
    }));
    
    // Count submissions in each range
    for (const submission of submissions) {
      if (submission.grade !== null && submission.grade !== undefined) {
        const percent = submission.grade;
        
        for (let i = 0; i < ranges.length; i++) {
          if (percent >= ranges[i].min && percent <= ranges[i].max) {
            distribution[i].count++;
            break;
          }
        }
      }
    }
    
    // Calculate percentages
    const totalSubmissions = submissions.length;
    for (const range of distribution) {
      range.percentage = totalSubmissions > 0
        ? Math.round((range.count / totalSubmissions) * 100)
        : 0;
    }
    
    // Additional statistics
    const grades = submissions
      .filter(s => s.grade !== null && s.grade !== undefined)
      .map(s => s.grade);
    
    const avgGrade = grades.length > 0
      ? Math.round(grades.reduce((sum, grade) => sum + grade, 0) / grades.length)
      : 0;
    
    const medianGrade = this.calculateMedian(grades);
    
    return {
      ranges: distribution,
      statistics: {
        average: avgGrade,
        median: medianGrade,
        highest: Math.max(...grades, 0),
        lowest: grades.length > 0 ? Math.min(...grades) : 0,
      },
    };
  }

  /**
   * Analyzes performance by rubric criteria
   */
  private analyzeCriteria(submissions: Submission[], rubric: Rubric): any[] {
    if (!rubric || !rubric.criteria || !submissions.length) {
      return [];
    }
    
    const criteriaAnalysis = [];
    
    for (const criterion of rubric.criteria) {
      const criterionScores = [];
      
      // Collect all scores for this criterion
      for (const submission of submissions) {
        if (
          submission.feedback &&
          submission.feedback.criteriaScores &&
          submission.feedback.criteriaScores[criterion.id] !== undefined
        ) {
          criterionScores.push(submission.feedback.criteriaScores[criterion.id]);
        }
      }
      
      if (criterionScores.length === 0) continue;
      
      // Calculate statistics
      const averageScore = criterionScores.reduce((sum, score) => sum + score, 0) / criterionScores.length;
      const maxPossible = criterion.maxScore;
      const percentageScore = maxPossible > 0 ? (averageScore / maxPossible) * 100 : 0;
      
      criteriaAnalysis.push({
        criterionId: criterion.id,
        criterionName: criterion.name,
        averageScore: Math.round(averageScore * 10) / 10, // Round to 1 decimal
        maxPossible,
        percentageScore: Math.round(percentageScore),
        scoreCounts: this.calculateScoreCounts(criterionScores, maxPossible),
      });
    }
    
    // Sort by performance (lowest first)
    return criteriaAnalysis.sort((a, b) => a.percentageScore - b.percentageScore);
  }

  /**
   * Calculates distribution of scores for a criterion
   */
  private calculateScoreCounts(scores: number[], maxScore: number): any {
    const counts = {};
    
    // Initialize counts for all possible scores
    for (let i = 0; i <= maxScore; i++) {
      counts[i] = 0;
    }
    
    // Count occurrences of each score
    for (const score of scores) {
      if (counts[score] !== undefined) {
        counts[score]++;
      }
    }
    
    // Convert to array format
    return Object.entries(counts).map(([score, count]) => ({
      score: parseInt(score),
      count: count as number,
      percentage: Math.round(((count as number) / scores.length) * 100),
    }));
  }

  /**
   * Calculates grading consistency metrics
   */
  private async calculateGradingConsistency(assignmentId: string): Promise<any> {
    // Get grading history for this assignment
    const gradingHistory = await this.gradingHistoryRepository.find({
      relations: ['submission', 'feedback'],
      where: {
        submission: {
          assignmentId,
        },
      },
      order: {
        gradedAt: 'ASC',
      },
    });
    
    if (gradingHistory.length < 5) {
      // Not enough data for meaningful consistency analysis
      return {
        deviationOverTime: null,
        consistencyScore: null,
        message: 'Not enough graded submissions for consistency analysis',
      };
    }
    
    // Calculate average score changes over time
    const timeSegments = 5; // Divide grading session into segments
    const segmentSize = Math.ceil(gradingHistory.length / timeSegments);
    const segmentAverages = [];
    
    for (let i = 0; i < timeSegments; i++) {
      const startIdx = i * segmentSize;
      const endIdx = Math.min(startIdx + segmentSize, gradingHistory.length);
      const segment = gradingHistory.slice(startIdx, endIdx);
      
      if (segment.length > 0) {
        const avgScore = segment.reduce((sum, entry) => sum + entry.totalScore, 0) / segment.length;
        segmentAverages.push({
          segment: i + 1,
          average: Math.round(avgScore * 10) / 10,
          entries: segment.length,
        });
      }
    }
    
    // Calculate standard deviation as consistency metric
    const allScores = gradingHistory.map(entry => entry.totalScore);
    const stdDev = this.calculateStandardDeviation(allScores);
    
    // Calculate consistency score (lower deviation = higher consistency)
    const maxConsistencyScore = 100;
    const maxAcceptableDeviation = 15; // Maximum acceptable standard deviation
    const consistencyScore = Math.max(
      0,
      Math.round(maxConsistencyScore * (1 - (stdDev / maxAcceptableDeviation)))
    );
    
    // Generate insight message
    let message = '';
    const firstAvg = segmentAverages[0]?.average || 0;
    const lastAvg = segmentAverages[segmentAverages.length - 1]?.average || 0;
    const difference = Math.abs(lastAvg - firstAvg);
    
    if (difference > 10) {
      message = lastAvg > firstAvg
        ? 'Grades trend significantly higher later in the grading session. Consider reviewing early grades.'
        : 'Grades trend significantly lower later in the grading session. Consider reviewing later grades.';
    } else if (difference > 5) {
      message = 'Slight grading drift detected. Consider calibration.';
    } else {
      message = 'Grading appears consistent throughout the session.';
    }
    
    return {
      deviationOverTime: segmentAverages,
      standardDeviation: Math.round(stdDev * 10) / 10,
      consistencyScore,
      message,
    };
  }

  /**
   * Calculates grading time analytics
   */
  private async calculateGradingTime(assignmentId: string): Promise<any> {
    // Get grading history with timestamps
    const gradingHistory = await this.gradingHistoryRepository.find({
      relations: ['submission'],
      where: {
        submission: {
          assignmentId,
        },
      },
      order: {
        gradedAt: 'ASC',
      },
    });
    
    if (gradingHistory.length < 2) {
      return {
        averageTimePerSubmission: null,
        totalGradingTime: null,
        message: 'Not enough data for time analysis',
      };
    }
    
    // Calculate time between consecutive gradings
    const gradingTimes = [];
    for (let i = 1; i < gradingHistory.length; i++) {
      const current = new Date(gradingHistory[i].gradedAt).getTime();
      const previous = new Date(gradingHistory[i - 1].gradedAt).getTime();
      const diffMinutes = (current - previous) / (1000 * 60);
      
      // Only count reasonable times (less than 30 minutes between submissions)
      // This filters out breaks between grading sessions
      if (diffMinutes < 30) {
        gradingTimes.push(diffMinutes);
      }
    }
    
    if (gradingTimes.length === 0) {
      return {
        averageTimePerSubmission: null,
        totalGradingTime: null,
        message: 'Could not determine grading time pattern',
      };
    }
    
    // Calculate statistics
    const averageTime = gradingTimes.reduce((sum, time) => sum + time, 0) / gradingTimes.length;
    const totalTimeMinutes = gradingTimes.reduce((sum, time) => sum + time, 0);
    
    // Format time values
    const formattedAverage = this.formatMinutes(averageTime);
    const formattedTotal = this.formatMinutes(totalTimeMinutes);
    
    // Generate insight
    let message = '';
    if (averageTime < 2) {
      message = 'Grading appears very quick. Ensure thorough feedback is provided.';
    } else if (averageTime > 10) {
      message = 'Grading is taking longer than typical. Consider simplifying rubric or feedback process.';
    } else {
      message = 'Grading pace appears efficient.';
    }
    
    return {
      averageTimePerSubmission: formattedAverage,
      totalGradingTime: formattedTotal,
      gradingTimes: gradingTimes.map(t => Math.round(t * 10) / 10),
      message,
    };
  }

  /**
   * Utility function to calculate median
   */
  private calculateMedian(values: number[]): number {
    if (values.length === 0) return 0;
    
    const sorted = [...values].sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);
    
    if (sorted.length % 2 === 0) {
      return (sorted[middle - 1] + sorted[middle]) / 2;
    } else {
      return sorted[middle];
    }
  }

  /**
   * Utility function to calculate standard deviation
   */
  private calculateStandardDeviation(values: number[]): number {
    if (values.length === 0) return 0;
    
    const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squareDiffs = values.map(value => {
      const diff = value - avg;
      return diff * diff;
    });
    
    const avgSquareDiff = squareDiffs.reduce((sum, val) => sum + val, 0) / squareDiffs.length;
    return Math.sqrt(avgSquareDiff);
  }

  /**
   * Formats minutes into readable time string
   */
  private formatMinutes(minutes: number): string {
    if (minutes < 1) {
      return `${Math.round(minutes * 60)} seconds`;
    } else if (minutes < 60) {
      return `${Math.round(minutes)} minutes`;
    } else {
      const hours = Math.floor(minutes / 60);
      const mins = Math.round(minutes % 60);
      return `${hours} hour${hours !== 1 ? 's' : ''} ${mins} minute${mins !== 1 ? 's' : ''}`;
    }
  }
}