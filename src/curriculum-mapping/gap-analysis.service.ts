import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Program } from '../entities/program.entity';
import { LearningOutcome, OutcomeLevel } from '../entities/learning-outcome.entity';
import { Mapping, CoverageLevel } from '../entities/mapping.entity';
import { Course } from '../entities/course.entity';
import { GapAnalysisQueryDto } from '../dto';

interface OutcomeGap {
  outcomeId: string;
  outcomeCode: string;
  outcomeDescription: string;
  coverageScore: number;
  assessmentCount: number;
  courseCount: number;
  gap: 'none' | 'low' | 'medium' | 'high';
  suggestions: string[];
}

interface GapAnalysisResponse {
  programId: string;
  programName: string;
  outcomeLevel: string;
  gaps: OutcomeGap[];
  overallCoverage: number;
  overallGapLevel: 'none' | 'low' | 'medium' | 'high';
  programSuggestions: string[];
}

@Injectable()
export class GapAnalysisService {
  constructor(
    @InjectRepository(Program)
    private readonly programRepository: Repository<Program>,
    @InjectRepository(LearningOutcome)
    private readonly outcomeRepository: Repository<LearningOutcome>,
    @InjectRepository(Mapping)
    private readonly mappingRepository: Repository<Mapping>,
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
  ) {}

  /**
   * Generates a gap analysis report for a program
   * 
   * @param programId The ID of the program to analyze
   * @param queryParams Additional query parameters
   * @returns Gap analysis report
   */
  async generateGapAnalysis(
    programId: string, 
    queryParams: GapAnalysisQueryDto
  ): Promise<GapAnalysisResponse> {
    // Check if program exists
    const program = await this.programRepository.findOneBy({ id: programId });
    if (!program) {
      throw new NotFoundException(`Program with ID ${programId} not found`);
    }

    // Get outcome level filter if present
    const outcomeLevel = queryParams.outcomeLevel || null;

    // Get all learning outcomes for the program with optional filtering
    const queryBuilder = this.outcomeRepository.createQueryBuilder('outcome')
      .where('outcome.program.id = :programId', { programId });
    
    if (outcomeLevel) {
      queryBuilder.andWhere('outcome.level = :level', { level: outcomeLevel });
    }
    
    const learningOutcomes = await queryBuilder.getMany();

    // Get all mappings for the program's outcomes
    const mappings = await this.mappingRepository.find({
      where: { learningOutcome: { program: { id: programId } } },
      relations: ['learningOutcome', 'course', 'assessment'],
    });

    // Calculate gaps for each outcome
    const gaps: OutcomeGap[] = await Promise.all(
      learningOutcomes.map(async outcome => {
        const outcomeMappings = mappings.filter(
          mapping => mapping.learningOutcome.id === outcome.id
        );

        // Count courses and assessments for this outcome
        const courseIds = new Set(
          outcomeMappings
            .filter(mapping => mapping.course)
            .map(mapping => mapping.course.id)
        );
        
        const assessmentCount = outcomeMappings
          .filter(mapping => mapping.assessment)
          .length;

        // Calculate coverage score based on mapping levels
        const coverageScores = {
          [CoverageLevel.INTRODUCED]: 1,
          [CoverageLevel.REINFORCED]: 2,
          [CoverageLevel.MASTERED]: 3,
        };

        let totalCoverageScore = 0;
        outcomeMappings.forEach(mapping => {
          totalCoverageScore += coverageScores[mapping.coverageLevel] || 0;
        });

        const courseCount = courseIds.size;
        const totalCourses = await this.courseRepository.countBy({ program: { id: programId } });
        
        // Normalize coverage score (0-100)
        const normalizedCoverage = totalCourses > 0 
          ? (courseCount / totalCourses) * 100 
          : 0;
        
        // Determine gap level
        let gap: 'none' | 'low' | 'medium' | 'high' = 'none';
        if (normalizedCoverage === 0) {
          gap = 'high';
        } else if (normalizedCoverage < 30) {
          gap = 'high';
        } else if (normalizedCoverage < 60) {
          gap = 'medium';
        } else if (normalizedCoverage < 85) {
          gap = 'low';
        }

        // Generate suggestions based on gap level
        const suggestions: string[] = [];
        if (queryParams.includeSuggestions) {
          if (gap === 'high') {
            suggestions.push(`Outcome "${outcome.code}" has very low coverage across the curriculum.`);
            suggestions.push(`Consider adding this outcome to more courses in the program.`);
            
            if (assessmentCount === 0) {
              suggestions.push(`No assessments are aligned to this outcome. Add assessments to verify achievement.`);
            }
          } else if (gap === 'medium') {
            suggestions.push(`Outcome "${outcome.code}" has moderate coverage and may need reinforcement.`);
            
            if (assessmentCount < 2) {
              suggestions.push(`Add more assessments to verify achievement of this outcome.`);
            }
          } else if (gap === 'low') {
            if (assessmentCount < 3) {
              suggestions.push(`Consider adding more diverse assessment methods for this outcome.`);
            }
          }
        }

        return {
          outcomeId: outcome.id,
          outcomeCode: outcome.code,
          outcomeDescription: outcome.description,
          coverageScore: normalizedCoverage,
          assessmentCount,
          courseCount,
          gap,
          suggestions,
        };
      })
    );

    // Calculate overall program coverage and gap level
    const totalOutcomes = gaps.length;
    const overallCoverage = totalOutcomes > 0
      ? gaps.reduce((sum, gap) => sum + gap.coverageScore, 0) / totalOutcomes
      : 0;

    let overallGapLevel: 'none' | 'low' | 'medium' | 'high' = 'none';
    if (overallCoverage < 30) {
      overallGapLevel = 'high';
    } else if (overallCoverage < 60) {
      overallGapLevel = 'medium';
    } else if (overallCoverage < 85) {
      overallGapLevel = 'low';
    }

    // Generate program-level suggestions
    const programSuggestions: string[] = [];
    if (queryParams.includeSuggestions) {
      const highGapOutcomes = gaps.filter(g => g.gap === 'high');
      const mediumGapOutcomes = gaps.filter(g => g.gap === 'medium');
      
      if (highGapOutcomes.length > 0) {
        programSuggestions.push(
          `${highGapOutcomes.length} outcomes have high gaps in curriculum coverage.`
        );
        
        if (highGapOutcomes.length > totalOutcomes / 3) {
          programSuggestions.push(
            `Consider a curriculum redesign to better distribute learning outcomes across courses.`
          );
        }
      }
      
      if (mediumGapOutcomes.length > 0) {
        programSuggestions.push(
          `${mediumGapOutcomes.length} outcomes have medium gaps in curriculum coverage.`
        );
      }
      
      if (overallGapLevel === 'high') {
        programSuggestions.push(
          `Overall program coverage is concerning. Review the curriculum mapping approach.`
        );
      }
    }

    // Create and return the response
    return {
      programId: program.id,
      programName: program.name,
      outcomeLevel: outcomeLevel || 'all',
      gaps,
      overallCoverage,
      overallGapLevel,
      programSuggestions,
    };
  }
}