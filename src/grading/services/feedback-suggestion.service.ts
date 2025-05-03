import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Submission } from '../entities/submission.entity';
import { FeedbackLibrary } from '../entities/feedback-library.entity';
import { Feedback } from '../entities/feedback.entity';

@Injectable()
export class FeedbackSuggestionService {
  constructor(
    @InjectRepository(FeedbackLibrary)
    private feedbackLibraryRepository: Repository<FeedbackLibrary>,
    @InjectRepository(Feedback)
    private feedbackRepository: Repository<Feedback>,
  ) {}

  /**
   * Generates feedback suggestions for a submission based on:
   * 1. Historical feedback for similar submissions
   * 2. Common feedback patterns for the course/assignment
   * 3. Rubric-specific feedback from the library
   */
  async generateSuggestions(submission: Submission): Promise<any> {
    const { assignmentId, content } = submission;
    const rubricCriteria = submission.assignment.rubric.criteria;
    const suggestions = {};
    
    // Generate suggestions for each rubric criterion
    for (const criterion of rubricCriteria) {
      const criterionSuggestions = await this.generateCriterionSuggestions(
        criterion.id,
        criterion.name,
        assignmentId,
        content,
      );
      
      suggestions[criterion.id] = criterionSuggestions;
    }
    
    // Generate overall feedback suggestion
    const overallSuggestion = await this.generateOverallFeedback(
      assignmentId,
      submission.assignment.courseId,
      content,
    );
    
    return {
      criterionSuggestions: suggestions,
      overallSuggestion,
    };
  }

  /**
   * Generates suggestions for a specific criterion
   */
  private async generateCriterionSuggestions(
    criterionId: string,
    criterionName: string,
    assignmentId: string,
    submissionContent: string,
  ): Promise<any[]> {
    // Get relevant feedback from library
    const libraryFeedback = await this.feedbackLibraryRepository.find({
      where: { category: criterionName },
      order: { usageCount: 'DESC' },
      take: 5,
    });
    
    // Get common feedback for this criterion across this assignment
    const commonFeedback = await this.getCommonFeedbackForCriterion(
      criterionId,
      assignmentId,
    );
    
    // Combine and rank suggestions
    const allSuggestions = [...libraryFeedback, ...commonFeedback];
    
    // Simple content-based relevance calculation
    const rankedSuggestions = allSuggestions.map(suggestion => {
      // Calculate relevance score based on content similarity
      const relevanceScore = this.calculateRelevance(suggestion.content, submissionContent);
      
      return {
        content: suggestion.content,
        usageCount: suggestion.usageCount || 1,
        relevanceScore,
        source: suggestion.source || 'feedback library',
      };
    });
    
    // Sort by combined score of relevance and usage count
    return rankedSuggestions
      .sort((a, b) => {
        // Combined score: 70% relevance, 30% usage popularity
        const scoreA = (a.relevanceScore * 0.7) + (Math.min(a.usageCount / 10, 1) * 0.3);
        const scoreB = (b.relevanceScore * 0.7) + (Math.min(b.usageCount / 10, 1) * 0.3);
        return scoreB - scoreA;
      })
      .slice(0, 3); // Return top 3 suggestions
  }

  /**
   * Gets common feedback used for a criterion across an assignment
   */
  private async getCommonFeedbackForCriterion(criterionId: string, assignmentId: string): Promise<any[]> {
    // This would typically involve a more complex query to analyze past feedback
    // Simplified version for demonstration
    const feedbackEntries = await this.feedbackRepository.find({
      relations: ['submission'],
      where: {
        submission: {
          assignmentId,
        },
      },
    });
    
    const criterionFeedback = [];
    
    for (const entry of feedbackEntries) {
      if (entry.comments && entry.comments[criterionId]) {
        criterionFeedback.push({
          content: entry.comments[criterionId],
          usageCount: 1,
          source: 'previous grading',
        });
      }
    }
    
    // Group and count similar feedback
    const groupedFeedback = this.groupSimilarFeedback(criterionFeedback);
    
    return groupedFeedback.slice(0, 5);
  }

  /**
   * Groups similar feedback entries and counts occurrences
   */
  private groupSimilarFeedback(feedbackEntries: any[]): any[] {
    const grouped = {};
    
    for (const entry of feedbackEntries) {
      let matched = false;
      
      // Check if this entry is similar to any existing group
      for (const key in grouped) {
        if (this.calculateSimilarity(entry.content, key) > 0.8) {
          grouped[key].usageCount += 1;
          matched = true;
          break;
        }
      }
      
      // If no match, create a new group
      if (!matched) {
        grouped[entry.content] = {
          content: entry.content,
          usageCount: 1,
          source: entry.source,
        };
      }
    }
    
    return Object.values(grouped).sort((a, b) => b.usageCount - a.usageCount);
  }

  /**
   * Generates overall feedback suggestion
   */
  private async generateOverallFeedback(
    assignmentId: string,
    courseId: string,
    submissionContent: string,
  ): Promise<string> {
    // Get relevant overall feedback from library
    const overallFeedback = await this.feedbackLibraryRepository.find({
      where: { category: 'overall', courseId },
      order: { usageCount: 'DESC' },
      take: 3,
    });
    
    if (overallFeedback.length > 0) {
      // Return most relevant feedback
      const ranked = overallFeedback.map(feedback => ({
        content: feedback.content,
        score: this.calculateRelevance(feedback.content, submissionContent),
      }));
      
      ranked.sort((a, b) => b.score - a.score);
      return ranked[0].content;
    }
    
    // Fallback to generic feedback
    return "Your submission has been reviewed. Please see the specific comments for each criterion.";
  }

  /**
   * Calculates relevance of feedback to submission content
   * Returns a score between 0-1
   */
  private calculateRelevance(feedback: string, submissionContent: string): number {
    // Basic implementation - would use more sophisticated approach in production
    // Convert both to lowercase for comparison
    const normalizedFeedback = feedback.toLowerCase();
    const normalizedContent = submissionContent.toLowerCase();
    
    // Extract key terms from feedback
    const keyTerms = this.extractKeyTerms(normalizedFeedback);
    
    // Count how many key terms appear in the submission
    let matchCount = 0;
    for (const term of keyTerms) {
      if (normalizedContent.includes(term)) {
        matchCount++;
      }
    }
    
    // Calculate relevance score
    return keyTerms.length > 0 ? matchCount / keyTerms.length : 0;
  }

  /**
   * Extracts key terms from text for comparison
   */
  private extractKeyTerms(text: string): string[] {
    // Remove common stop words and extract meaningful terms
    // This is a simplified implementation
    const stopWords = new Set([
      'a', 'an', 'the', 'and', 'or', 'but', 'is', 'are', 'was', 'were',
      'to', 'of', 'in', 'for', 'with', 'on', 'at', 'by', 'this', 'that',
    ]);
    
    return text
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3 && !stopWords.has(word));
  }

  /**
   * Calculates simple text similarity
   * Returns a score between 0-1
   */
  private calculateSimilarity(text1: string, text2: string): number {
    // Extract key terms
    const terms1 = new Set(this.extractKeyTerms(text1.toLowerCase()));
    const terms2 = new Set(this.extractKeyTerms(text2.toLowerCase()));
    
    if (terms1.size === 0 || terms2.size === 0) return 0;
    
    // Count common terms
    let commonCount = 0;
    for (const term of terms1) {
      if (terms2.has(term)) {
        commonCount++;
      }
    }
    
    // Jaccard similarity: size of intersection divided by size of union
    const unionSize = terms1.size + terms2.size - commonCount;
    return unionSize > 0 ? commonCount / unionSize : 0;
  }
}