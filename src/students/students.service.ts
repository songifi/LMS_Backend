import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from './entities/student.entity';
import { Enrollment, EnrollmentStatus } from './entities/enrollment.entity';
import { StudentPreference } from './entities/student-preference.entity';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { CreatePreferenceDto } from './dto/create-preference.dto';

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(Student)
    private studentsRepository: Repository<Student>,
    @InjectRepository(Enrollment)
    private enrollmentsRepository: Repository<Enrollment>,
    @InjectRepository(StudentPreference)
    private preferencesRepository: Repository<StudentPreference>,
  ) {}

  async create(createStudentDto: CreateStudentDto): Promise<Student> {
    const student = this.studentsRepository.create(createStudentDto);
    return this.studentsRepository.save(student);
  }

  async findAll(page = 1, limit = 10): Promise<{ data: Student[]; total: number }> {
    const [data, total] = await this.studentsRepository.findAndCount({
      take: limit,
      skip: (page - 1) * limit,
      relations: ['preferences'],
    });
    return { data, total };
  }

  async findOne(id: string): Promise<Student> {
    const student = await this.studentsRepository.findOne({
      where: { id },
      relations: ['preferences', 'enrollments', 'enrollments.course'],
    });
    
    if (!student) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }
    
    return student;
  }

  async update(id: string, updateStudentDto: UpdateStudentDto): Promise<Student> {
    const student = await this.findOne(id);
    return this.studentsRepository.save({ ...student, ...updateStudentDto });
  }

  async remove(id: string): Promise<void> {
    const student = await this.findOne(id);
    await this.studentsRepository.remove(student);
  }

  async addPreference(
    studentId: string, 
    createPreferenceDto: CreatePreferenceDto
  ): Promise<StudentPreference> {
    const student = await this.findOne(studentId);
    
    const preference = this.preferencesRepository.create({
      ...createPreferenceDto,
      student,
    });
    
    return this.preferencesRepository.save(preference);
  }

  async getPreferences(studentId: string): Promise<StudentPreference[]> {
    const student = await this.findOne(studentId);
    return this.preferencesRepository.find({
      where: { student: { id: student.id } },
    });
  }

  async getAcademicHistory(studentId: string): Promise<Enrollment[]> {
    const student = await this.findOne(studentId);
    return this.enrollmentsRepository.find({
      where: { 
        student: { id: student.id },
        status: EnrollmentStatus.COMPLETED, 
      },
      relations: ['course'],
      order: { year: 'DESC', semester: 'DESC' },
    });
  }
}