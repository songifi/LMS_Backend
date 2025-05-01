import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Program } from '../entities/program.entity';
import { Course } from '../entities/course.entity';
import { LearningOutcome } from '../entities/learning-outcome.entity';
import { Mapping } from '../entities/mapping.entity';

interface CourseOutcomeMapping {
  courseId: string;
  courseCode: string;
  courseTitle: string;
  outcomes: {
    outcomeId: string;
    outcomeCode: string;
    coverageLevel: string;
  }[];
}

interface VisualMappingResponse {
  programId: string;
  programName: string;
  programCode: string;
  courseOutcomeMappings: CourseOutcomeMapping[];
  learningOutcomes: {
    id: string;
    code: string;
    description: string;
    level: string;
  }[];
}

@Injectable()
export class VisualMappingService {
  constructor(
    @InjectRepository(Program)
    private readonly programRepository: Repository<Program>,
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    @InjectRepository(LearningOutcome)
    private readonly outcomeRepository: Repository<LearningOutcome>,
    @InjectRepository(Mapping)
    private readonly mappingRepository: Repository<Mapping>,
  ) {}

  /**
   * Generates a visual mapping of courses to learning outcomes for a program
   * 
   * @param programId The ID of the program to generate mapping for
   * @returns Visual mapping data structure for frontend rendering
   */
  async generateVisualMapping(programId: string): Promise<VisualMappingResponse> {
    // Check if program exists
    const program = await this.programRepository.findOneBy({ id: programId });
    if (!program) {
      throw new NotFoundException(`Program with ID ${programId} not found`);
    }

    // Get all learning outcomes for the program
    const learningOutcomes = await this.outcomeRepository.find({
      where: { program: { id: programId } },
    });

    // Get all courses for the program
    const courses = await this.courseRepository.find({
      where: { program: { id: programId } },
    });

    // Get all mappings for the program's courses and outcomes
    const mappings = await this.mappingRepository.find({
      where: [
        { course: { program: { id: programId } } },
        { learningOutcome: { program: { id: programId } } },
      ],
      relations: ['course', 'learningOutcome'],
    });

    // Build course-outcome mapping structure
    const courseOutcomeMappings: CourseOutcomeMapping[] = courses.map(course => {
      const courseMappings =
        mappings.filter(mapping => mapping.course.id === course.id);
      return {
        courseId: course.id,
        courseCode: course.code,
        courseTitle: course.title,
        outcomes: courseMappings.map(mapping => ({
          outcomeId: mapping.learningOutcome.id,
          outcomeCode: mapping.learningOutcome.code,
          coverageLevel: mapping.coverageLevel,
        })),
      };
    });