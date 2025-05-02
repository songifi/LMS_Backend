import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, In } from 'typeorm';
import { Course } from './entities/course.entity';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';

@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(Course)
    private coursesRepository: Repository<Course>,
  ) {}

  async create(createCourseDto: CreateCourseDto): Promise<Course> {
    const course = this.coursesRepository.create(createCourseDto);
    return this.coursesRepository.save(course);
  }

  async findAll(
    page = 1, 
    limit = 10,
    department?: string,
    search?: string,
  ): Promise<{ data: Course[]; total: number }> {
    const queryBuilder = this.coursesRepository.createQueryBuilder('course');
    
    if (department) {
      queryBuilder.where('course.department = :department', { department });
    }
    
    if (search) {
      queryBuilder.andWhere(
        '(course.title ILIKE :search OR course.code ILIKE :search OR course.description ILIKE :search)',
        { search: `%${search}%` }
      );
    }
    
    const [data, total] = await queryBuilder
      .take(limit)
      .skip((page - 1) * limit)
      .getManyAndCount();
      
    return { data, total };
  }

  async findOne(id: string): Promise<Course> {
    const course = await this.coursesRepository.findOne({
      where: { id },
      relations: ['relatedCourses'],
    });
    
    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }
    
    return course;
  }

  async findByIds(ids: string[]): Promise<Course[]> {
    return this.coursesRepository.find({
      where: { id: In(ids) },
    });
  }

  async findByCodes(codes: string[]): Promise<Course[]> {
    return this.coursesRepository.find({
      where: { code: In(codes) },
    });
  }

  async update(id: string, updateCourseDto: UpdateCourseDto): Promise<Course> {
    const course = await this.findOne(id);
    return this.coursesRepository.save({ ...course, ...updateCourseDto });
  }

  async remove(id: string): Promise<void> {
    const course = await this.findOne(id);
    await this.coursesRepository.remove(course);
  }
  
  async getPrerequisites(id: string): Promise<Course[]> {
    const course = await this.findOne(id);
    
    if (!course.prerequisites || course.prerequisites.length === 0) {
      return [];
    }
    
    return this.findByCodes(course.prerequisites);
  }
  
  async getRelatedCourses(id: string): Promise<Course[]> {
    const course = await this.findOne(id);
    return course.relatedCourses || [];
  }
}