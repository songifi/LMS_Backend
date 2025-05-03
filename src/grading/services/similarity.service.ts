import { Injectable } from '@nestjs/common';
import { Submission } from '../entities/submission.entity';
import * as textSimilarity from 'text-similarity';

@Injectable()
export class SimilarityService {
  /**
   * Detects similarities between submissions
   * @param submissions List of submissions to compare
   * @param threshold Similarity threshold percentage (0-100)
   * @returns Array of similarity matches with scores
   */
  async detectSimilarities(submissions: Submission[], threshold: number = 70): Promise<any> {
    const results = [];
    const normalizedThreshold = threshold / 100; // Convert to 0-1 scale
    
    // Compare each submission with every other submission
    for (let i = 0; i < submissions.length; i++) {
      for (let j = i + 1; j < submissions.length; j++) {
        const submission1 = submissions[i];
        const submission2 = submissions[j];
        
        // Skip if either submission has no content
        if (!submission1.content || !submission2.content) {
          continue;
        }
        
        const similarityScore = await this.calculateSimilarity(
          submission1.content,
          submission2.content,
        );
        
        if (similarityScore >= normalizedThreshold) {
          results.push({
            submission1: {
              id: submission1.id,
              studentId: submission1.studentId,
              studentName: submission1.studentName,
            },
            submission2: {
              id: submission2.id,
              studentId: submission2.studentId,
              studentName: submission2.studentName,
            },
            similarityScore: Math.round(similarityScore * 100), // Convert back to percentage
            flagged: similarityScore >= 0.85, // Flag high similarity
          });
        }
      }
    }
    
    // Sort by similarity score (highest first)
    return results.sort((a, b) => b.similarityScore - a.similarityScore);
  }

  /**
   * Calculates similarity between two text strings
   * Uses a combination of different algorithms for better accuracy
   */
  private async calculateSimilarity(text1: string, text2: string): Promise<number> {
    // Normalize texts (lowercase, remove excess whitespace)
    const normalizedText1 = this.normalizeText(text1);
    const normalizedText2 = this.normalizeText(text2);
    
    // Use external library for cosine similarity
    const similarityScore = textSimilarity.similarity(normalizedText1, normalizedText2);
    
    // Additional custom checks for common plagiarism techniques
    const lengthRatio = this.calculateLengthRatio(normalizedText1, normalizedText2);
    const structuralSimilarity = this.calculateStructuralSimilarity(normalizedText1, normalizedText2);
    
    // Weighted combination of different similarity measures
    const combinedScore = (similarityScore * 0.6) + (lengthRatio * 0.2) + (structuralSimilarity * 0.2);
    
    return Math.min(1, combinedScore); // Ensure score doesn't exceed 1
  }

  /**
   * Normalizes text for comparison
   */
  private normalizeText(text: string): string {
    return text
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Calculates length ratio between two texts
   * Returns a value between 0-1, where 1 means texts are of similar length
   */
  private calculateLengthRatio(text1: string, text2: string): number {
    const length1 = text1.length;
    const length2 = text2.length;
    
    if (length1 === 0 && length2 === 0) return 1;
    if (length1 === 0 || length2 === 0) return 0;
    
    const minLength = Math.min(length1, length2);
    const maxLength = Math.max(length1, length2);
    
    return minLength / maxLength;
  }

  /**
   * Calculates structural similarity between texts
   * Looks for similar paragraph/sentence structure
   */
  private calculateStructuralSimilarity(text1: string, text2: string): number {
    // Split into paragraphs
    const paragraphs1 = text1.split(/\n\s*\n/);
    const paragraphs2 = text2.split(/\n\s*\n/);
    
    // Compare paragraph counts
    const paragraphRatio = this.calculateLengthRatio(
      paragraphs1.length.toString(),
      paragraphs2.length.toString(),
    );
    
    // Calculate average sentence length similarity
    const avgSentenceLength1 = this.calculateAverageSentenceLength(text1);
    const avgSentenceLength2 = this.calculateAverageSentenceLength(text2);
    const sentenceLengthRatio = this.calculateLengthRatio(
      avgSentenceLength1.toString(),
      avgSentenceLength2.toString(),
    );
    
    return (paragraphRatio + sentenceLengthRatio) / 2;
  }

  /**
   * Calculates average sentence length in a text
   */
  private calculateAverageSentenceLength(text: string): number {
    const sentences = text.split(/[.!?]+/);
    const wordCounts = sentences.map(sentence => 
      sentence.trim().split(/\s+/).filter(word => word.length > 0).length
    );
    
    const totalWords = wordCounts.reduce((sum, count) => sum + count, 0);
    const validSentences = wordCounts.filter(count => count > 0).length;
    
    return validSentences === 0 ? 0 : totalWords / validSentences;
  }
}