import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { DegreeProgram } from './entities/degree-program.entity';
import { DegreeRequirement } from './entities/degree-requirement.entity';
import { CreateDegreeProgramDto } from './dto/create-degree-program.dto';
import { CreateDegreeRequirementDto } from './dto/create-degree-requirement.dto';
import { Course } from '../courses/entities/course.entity';
import { Student } from '../students/entities/student.entity';
import { Enrollment, EnrollmentStatus } from '../students/entities/enrollment.entity';

@Injectable()
export class DegreeAuditService {
  constructor(
    @InjectRepository(DegreeProgram)
    private degreeProgramRepository: Repository<DegreeProgram>,
    @InjectRepository(DegreeRequirement)
    private degreeRequirementRepository: Repository<DegreeRequirement>,
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
    @InjectRepository(Enrollment)
    private enrollmentRepository: Repository<Enrollment>,
  ) {}

  async createDegreeProgram(createDegreeProgramDto: CreateDegreeProgramDto): Promise<DegreeProgram> {
    const existingProgram = await this.degreeProgramRepository.findOne({
      where: {
        name: createDegreeProgramDto.name,
        degreeType: createDegreeProgramDto.degreeType,
        department: createDegreeProgramDto.department,
      },
    });

    if (existingProgram) {
      throw new ConflictException(`Degree program already exists`);
    }

    const degreeProgram = this.degreeProgramRepository.create(createDegreeProgramDto);
    return this.degreeProgramRepository.save(degreeProgram);
  }

  async findAllDegreePrograms(): Promise<DegreeProgram[]> {
    return this.degreeProgramRepository.find();
  }

  async findDegreeProgram(id: string): Promise<DegreeProgram> {
    const program = await this.degreeProgramRepository.findOne({
      where: { id },
      relations: ['requirements', 'requirements.courses'],
    });

    if (!program) {
      throw new NotFoundException(`Degree program with ID ${id} not found`);
    }

    return program;
  }

  async addRequirement(
    programId: string,
    createRequirementDto: CreateDegreeRequirementDto,
  ): Promise<DegreeRequirement> {
    const program = await this.findDegreeProgram(programId);
    
    // Find courses
    const courses = await this.courseRepository.find({
      where: { id: In(createRequirementDto.courseIds) },
    });

    if (courses.length !== createRequirementDto.courseIds.length) {
      throw new NotFoundException('One or more courses not found');
    }

    const requirement = this.degreeRequirementRepository.create({
      ...createRequirementDto,
      degreeProgram: program,
      courses,
    });

    return this.degreeRequirementRepository.save(requirement);
  }

  async findRequirements(programId: string): Promise<DegreeRequirement[]> {
    const program = await this.findDegreeProgram(programId);
    
    return this.degreeRequirementRepository.find({
      where: { degreeProgram: { id: program.id } },
      relations: ['courses'],
    });
  }

  async findRequirement(id: string): Promise<DegreeRequirement> {
    const requirement = await this.degreeRequirementRepository.findOne({
      where: { id },
      relations: ['courses', 'degreeProgram'],
    });

    if (!requirement) {
      throw new NotFoundException(`Requirement with ID ${id} not found`);
    }

    return requirement;
  }

  async auditStudentProgress(studentId: string, programId: string): Promise<any> {
    const student = await this.studentRepository.findOne({
      where: { id: studentId },
    });

    if (!student) {
      throw new NotFoundException(`Student with ID ${studentId} not found`);
    }

    const program = await this.findDegreeProgram(programId);
    const requirements = await this.findRequirements(programId);
    
    // Get completed courses for the student
    const completedEnrollments = await this.enrollmentRepository.find({
      where: { 
        student: { id: studentId },
        status: EnrollmentStatus.COMPLETED,
      },
      relations: ['course'],
    });

    const completedCourses = completedEnrollments.map(enrollment => enrollment.course);
    const completedCourseIds = completedCourses.map(course => course.id);
    
    // Calculate credits completed
    const totalCreditsCompleted = completedCourses.reduce(
      (sum, course) => sum + course.creditHours, 
      0
    );

    // Analyze each requirement
    const requirementProgress = requirements.map(requirement => {
      const requirementCourseIds = requirement.courses.map(course => course.id);
      
      // Find courses that fulfill this requirement and have been completed
      const fulfilledCourseIds = requirementCourseIds.filter(id => 
        completedCourseIds.includes(id)
      );

      // Get the actual course objects for completed courses in this requirement
      const fulfilledCourses = requirement.courses.filter(course => 
        fulfilledCourseIds.includes(course.id)
      );

      // Calculate credits earned toward this requirement
      const creditsEarned = fulfilledCourses.reduce(
        (sum, course) => sum + course.creditHours,
        0
      );

      // Determine if requirement is satisfied
      const creditsSatisfied = creditsEarned >= requirement.minCredits;
      const coursesSatisfied = !requirement.minCourses || fulfilledCourses.length >= requirement.minCourses;
      
      return {
        requirement,
        creditsEarned,
        creditsSatisfied,
        coursesSatisfied,
        coursesCompleted: fulfilledCourses.length,
        isSatisfied: creditsSatisfied && coursesSatisfied,
        completedCourses: fulfilledCourses,
        remainingCredits: Math.max(0, requirement.minCredits - creditsEarned),
        remainingCourses: requirement.minCourses 
          ? Math.max(0, requirement.minCourses - fulfilledCourses.length)
          : 0,
      };
    });

    // Determine overall progress
    const satisfiedRequirements = requirementProgress.filter(progress => progress.isSatisfied);
    const overallProgress = {
      totalRequirements: requirements.length,
      satisfiedRequirements: satisfiedRequirements.length,
      totalCreditsRequired: program.totalCreditsRequired,
      totalCreditsCompleted,
      remainingCredits: Math.max(0, program.totalCreditsRequired - totalCreditsCompleted),
      percentageComplete: Math.min(
        100,
        Math.round((totalCreditsCompleted / program.totalCreditsRequired) * 100)
      ),
    };

    return {
      student,
      program,
      overallProgress,
      requirementProgress,
    };
  }
}