import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LearningOutcome } from './entities/learning-outcome.entity';
import { Course } from './entities/course.entity';
import { Assessment } from './entities/assessment.entity';
import { Mapping } from './entities/mapping.entity';
import { Program } from './entities/program.entity';
import { 
  CreateMappingDto, 
  UpdateMappingDto, 
  CreateOutcomeDto, 
  CreateCourseDto,
  CreateAssessmentDto,
  CreateProgramDto 
} from './dto';

@Injectable()
export class CurriculumMappingService {
  constructor(
    @InjectRepository(LearningOutcome)
    private readonly learningOutcomeRepository: Repository<LearningOutcome>,
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    @InjectRepository(Assessment)
    private readonly assessmentRepository: Repository<Assessment>,
    @InjectRepository(Mapping)
    private readonly mappingRepository: Repository<Mapping>,
    @InjectRepository(Program)
    private readonly programRepository: Repository<Program>,
  ) {}

  // Program methods
  async createProgram(createProgramDto: CreateProgramDto) {
    const program = this.programRepository.create({
      ...createProgramDto,
      createdAt: new Date(),
    });
    return await this.programRepository.save(program);
  }

  async findAllPrograms() {
    return await this.programRepository.find();
  }

  async findOneProgram(id: string) {
    const program = await this.programRepository.findOne({ 
      where: { id },
      relations: ['learningOutcomes', 'courses']
    });
    
    if (!program) {
      throw new NotFoundException(`Program with ID ${id} not found`);
    }
    
    return program;
  }

  // Learning Outcome methods
  async createLearningOutcome(createOutcomeDto: CreateOutcomeDto) {
    const program = await this.programRepository.findOneBy({ id: createOutcomeDto.programId });
    
    if (!program) {
      throw new NotFoundException(`Program with ID ${createOutcomeDto.programId} not found`);
    }
    
    const learningOutcome = this.learningOutcomeRepository.create({
      ...createOutcomeDto,
      program,
      createdAt: new Date(),
    });
    
    return await this.learningOutcomeRepository.save(learningOutcome);
  }

  async findAllLearningOutcomes() {
    return await this.learningOutcomeRepository.find({
      relations: ['program']
    });
  }

  // Course methods
  async createCourse(createCourseDto: CreateCourseDto) {
    const program = await this.programRepository.findOneBy({ id: createCourseDto.programId });
    
    if (!program) {
      throw new NotFoundException(`Program with ID ${createCourseDto.programId} not found`);
    }
    
    const course = this.courseRepository.create({
      ...createCourseDto,
      program,
      createdAt: new Date(),
    });
    
    return await this.courseRepository.save(course);
  }

  async findAllCourses() {
    return await this.courseRepository.find({
      relations: ['program']
    });
  }

  // Assessment methods
  async createAssessment(createAssessmentDto: CreateAssessmentDto) {
    const course = await this.courseRepository.findOneBy({ id: createAssessmentDto.courseId });
    
    if (!course) {
      throw new NotFoundException(`Course with ID ${createAssessmentDto.courseId} not found`);
    }
    
    const assessment = this.assessmentRepository.create({
      ...createAssessmentDto,
      course,
      createdAt: new Date(),
    });
    
    return await this.assessmentRepository.save(assessment);
  }

  async findAllAssessments() {
    return await this.assessmentRepository.find({
      relations: ['course']
    });
  }

  // Mapping methods
  async createMapping(createMappingDto: CreateMappingDto) {
    const learningOutcome = await this.learningOutcomeRepository.findOneBy({ 
      id: createMappingDto.learningOutcomeId 
    });
    
    if (!learningOutcome) {
      throw new NotFoundException(
        `Learning Outcome with ID ${createMappingDto.learningOutcomeId} not found`
      );
    }
    
    let course = null;
    if (createMappingDto.courseId) {
      course = await this.courseRepository.findOneBy({ id: createMappingDto.courseId });
      if (!course) {
        throw new NotFoundException(`Course with ID ${createMappingDto.courseId} not found`);
      }
    }
    
    let assessment = null;
    if (createMappingDto.assessmentId) {
      assessment = await this.assessmentRepository.findOneBy({ id: createMappingDto.assessmentId });
      if (!assessment) {
        throw new NotFoundException(`Assessment with ID ${createMappingDto.assessmentId} not found`);
      }
    }
    
    const mapping = this.mappingRepository.create({
      learningOutcome,
      course,
      assessment,
      coverageLevel: createMappingDto.coverageLevel,
      notes: createMappingDto.notes,
      createdAt: new Date(),
    });
    
    return await this.mappingRepository.save(mapping);
  }

  async findAllMappings() {
    return await this.mappingRepository.find({
      relations: ['learningOutcome', 'course', 'assessment']
    });
  }

  async updateMapping(id: string, updateMappingDto: UpdateMappingDto) {
    const mapping = await this.mappingRepository.findOne({ 
      where: { id },
      relations: ['learningOutcome', 'course', 'assessment']
    });
    
    if (!mapping) {
      throw new NotFoundException(`Mapping with ID ${id} not found`);
    }
    
    // Update mapping properties
    if (updateMappingDto.coverageLevel) {
      mapping.coverageLevel = updateMappingDto.coverageLevel;
    }
    
    if (updateMappingDto.notes !== undefined) {
      mapping.notes = updateMappingDto.notes;
    }
    
    mapping.updatedAt = new Date();
    
    return await this.mappingRepository.save(mapping);
  }

  async removeMapping(id: string) {
    const mapping = await this.mappingRepository.findOneBy({ id });
    
    if (!mapping) {
      throw new NotFoundException(`Mapping with ID ${id} not found`);
    }
    
    return await this.mappingRepository.remove(mapping);
  }
}