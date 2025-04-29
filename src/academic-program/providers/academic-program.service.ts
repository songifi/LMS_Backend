import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Curriculum } from '../entities/curriculum.entity';
import { Requirement } from '../entities/requirement.entity';
import { CourseSequence } from '../entities/course-sequence.entity';
import { ProgramOutcome } from '../entities/program-outcome.entity';
import { CurriculumVersion } from '../entities/curriculum-version.entity';
import { ProgramEnrollment } from '../entities/program-enrollment.entity';
import { CreateCurriculumDto } from '../dto/create-curriculum.dto';
import { CreateRequirementDto } from '../dto/create-requirement.dto';
import { CreateCourseSequenceDto } from '../dto/create-course-sequence.dto';
import { CreateProgramOutcomeDto } from '../dto/create-program-outcome.dto';
import { CreateCurriculumVersionDto } from '../dto/create-curriculum-version.dto';
import { CreateProgramEnrollmentDto } from '../dto/create-program-enrollment.dto';
import { Program } from '../entities/academic-program.entity';
import { CreateProgramDto } from '../dto/create-academic-program.dto';
import { UpdateProgramDto } from '../dto/update-academic-program.dto';

@Injectable()
export class ProgramService {
  constructor(
    @InjectRepository(Program)
    private programRepository: Repository<Program>,
    @InjectRepository(Curriculum)
    private curriculumRepository: Repository<Curriculum>,
    @InjectRepository(Requirement)
    private requirementRepository: Repository<Requirement>,
    @InjectRepository(CourseSequence)
    private courseSequenceRepository: Repository<CourseSequence>,
    @InjectRepository(ProgramOutcome)
    private programOutcomeRepository: Repository<ProgramOutcome>,
    @InjectRepository(CurriculumVersion)
    private curriculumVersionRepository: Repository<CurriculumVersion>,
    @InjectRepository(ProgramEnrollment)
    private programEnrollmentRepository: Repository<ProgramEnrollment>,
  ) {}

  // Program Methods
  async findAllPrograms(): Promise<Program[]> {
    return this.programRepository.find();
  }

  async createProgram(createProgramDto: CreateProgramDto): Promise<Program> {
    const program = this.programRepository.create(createProgramDto);
    return this.programRepository.save(program);
  }

  async findProgramById(id: string): Promise<Program> {
    const program = await this.programRepository.findOne({ where: { id } });
    if (!program) {
      throw new NotFoundException(`Program with ID ${id} not found`);
    }
    return program;
  }

  async updateProgram(id: string, updateProgramDto: UpdateProgramDto): Promise<Program> {
    const program = await this.findProgramById(id);
    Object.assign(program, updateProgramDto);
    return this.programRepository.save(program);
  }

  async deleteProgram(id: string): Promise<void> {
    const program = await this.findProgramById(id);
    await this.programRepository.remove(program);
  }

  // Curriculum Methods
  async findProgramCurricula(programId: string): Promise<Curriculum[]> {
    await this.findProgramById(programId); // Validate program exists
    return this.curriculumRepository.find({ where: { programId } });
  }

  async createCurriculum(createCurriculumDto: CreateCurriculumDto): Promise<Curriculum> {
    await this.findProgramById(createCurriculumDto.programId); // Validate program exists
    const curriculum = this.curriculumRepository.create(createCurriculumDto);
    return this.curriculumRepository.save(curriculum);
  }

  // Requirement Methods
  async findProgramRequirements(programId: string): Promise<Requirement[]> {
    await this.findProgramById(programId); // Validate program exists
    return this.requirementRepository.find({ where: { programId } });
  }

  async createRequirement(createRequirementDto: CreateRequirementDto): Promise<Requirement> {
    await this.findProgramById(createRequirementDto.programId); // Validate program exists
    const requirement = this.requirementRepository.create(createRequirementDto);
    return this.requirementRepository.save(requirement);
  }

  // CourseSequence Methods
  async findCurriculumCourseSequences(curriculumId: string): Promise<CourseSequence[]> {
    return this.courseSequenceRepository.find({ where: { curriculumId } });
  }

  async createCourseSequence(createCourseSequenceDto: CreateCourseSequenceDto): Promise<CourseSequence> {
    const courseSequence = this.courseSequenceRepository.create(createCourseSequenceDto);
    return this.courseSequenceRepository.save(courseSequence);
  }

  // ProgramOutcome Methods
  async findProgramOutcomes(programId: string): Promise<ProgramOutcome[]> {
    await this.findProgramById(programId); // Validate program exists
    return this.programOutcomeRepository.find({ where: { programId } });
  }

  async createProgramOutcome(createProgramOutcomeDto: CreateProgramOutcomeDto): Promise<ProgramOutcome> {
    await this.findProgramById(createProgramOutcomeDto.programId); // Validate program exists
    const outcome = this.programOutcomeRepository.create(createProgramOutcomeDto);
    return this.programOutcomeRepository.save(outcome);
  }

  // CurriculumVersion Methods
  async findCurriculumVersions(curriculumId: string): Promise<CurriculumVersion[]> {
    return this.curriculumVersionRepository.find({ where: { curriculumId } });
  }

  async createCurriculumVersion(createCurriculumVersionDto: CreateCurriculumVersionDto): Promise<CurriculumVersion> {
    const version = this.curriculumVersionRepository.create(createCurriculumVersionDto);
    return this.curriculumVersionRepository.save(version);
  }

  // ProgramEnrollment Methods
  async findProgramEnrollments(programId: string): Promise<ProgramEnrollment[]> {
    await this.findProgramById(programId); // Validate program exists
    return this.programEnrollmentRepository.find({ where: { programId } });
  }

  async createProgramEnrollment(createProgramEnrollmentDto: CreateProgramEnrollmentDto): Promise<ProgramEnrollment> {
    await this.findProgramById(createProgramEnrollmentDto.programId); // Validate program exists
    const enrollment = this.programEnrollmentRepository.create(createProgramEnrollmentDto);
    return this.programEnrollmentRepository.save(enrollment);
  }

  async findEnrollmentById(id: string): Promise<ProgramEnrollment> {
    const enrollment = await this.programEnrollmentRepository.findOne({ where: { id } });
    if (!enrollment) {
      throw new NotFoundException(`Program enrollment with ID ${id} not found`);
    }
    return enrollment;
  }

  async updateEnrollmentProgress(id: string, progressTracking: Record<string, any>): Promise<ProgramEnrollment> {
    const enrollment = await this.findEnrollmentById(id);
    enrollment.progressTracking = progressTracking;
    return this.programEnrollmentRepository.save(enrollment);
  }
}