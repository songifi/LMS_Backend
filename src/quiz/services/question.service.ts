import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Question } from '../entities/question.entity';
import { QuestionVersion } from '../entities/question-version.entity';
import { Tag } from '../entities/tag.entity';
import { Category } from '../entities/category.entity';
import { CreateQuestionDto } from '../dtos/create-question.dto';
import { UpdateQuestionDto } from '../dtos/update-question.dto';
import { QuestionFilterDto } from '../dtos/question-filter.dto';
import { VersionControlService } from './version-control.service';
import { AnalyticsService } from './analytics.service';
import { DifficultyService } from './difficulty.service';

@Injectable()
export class QuestionService {
  constructor(
    @InjectRepository(Question)
    private questionRepository: Repository<Question>,
    @InjectRepository(QuestionVersion)
    private questionVersionRepository: Repository<QuestionVersion>,
    @InjectRepository(Tag)
    private tagRepository: Repository<Tag>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    private versionControlService: VersionControlService,
    private analyticsService: AnalyticsService,
    private difficultyService: DifficultyService,
  ) {}

  async create(createQuestionDto: CreateQuestionDto): Promise<Question> {
    // Initialize default difficulty metrics
    const difficultyMetrics = this.difficultyService.initializeDifficultyMetrics(
      createQuestionDto.initialDifficulty || 50,
    );
    
    const question = this.questionRepository.create({
      ...createQuestionDto,
      difficultyMetrics,
      currentVersion: 1,
    });
    
    const savedQuestion = await this.questionRepository.save(question);
    
    // Create the initial version
    await this.versionControlService.createVersion(savedQuestion, 'Initial version');
    
    return savedQuestion;
  }

  async findAll(filterDto: QuestionFilterDto): Promise<Question[]> {
    const query = this.questionRepository.createQueryBuilder('question')
      .leftJoinAndSelect('question.tags', 'tag')
      .leftJoinAndSelect('question.categories', 'category');
    
    if (filterDto.type) {
      query.andWhere('question.type = :type', { type: filterDto.type });
    }
    
    if (filterDto.search) {
      query.andWhere(
        '(LOWER(question.title) LIKE LOWER(:search) OR LOWER(question.description) LIKE LOWER(:search))',
        { search: `%${filterDto.search}%` },
      );
    }
    
    if (filterDto.tagIds && filterDto.tagIds.length > 0) {
      query.andWhere('tag.id IN (:...tagIds)', { tagIds: filterDto.tagIds });
    }
    
    if (filterDto.categoryIds && filterDto.categoryIds.length > 0) {
      query.andWhere('category.id IN (:...categoryIds)', { categoryIds: filterDto.categoryIds });
    }
    
    if (filterDto.difficultyMin !== undefined) {
      query.andWhere('question.difficultyMetrics->>\'currentDifficulty\' >= :difficultyMin', 
        { difficultyMin: filterDto.difficultyMin });
    }
    
    if (filterDto.difficultyMax !== undefined) {
      query.andWhere('question.difficultyMetrics->>\'currentDifficulty\' <= :difficultyMax', 
        { difficultyMax: filterDto.difficultyMax });
    }
    
    if (filterDto.active !== undefined) {
      query.andWhere('question.active = :active', { active: filterDto.active });
    }
    
    if (filterDto.createdAfter) {
      query.andWhere('question.createdAt >= :createdAfter', { createdAfter: filterDto.createdAfter });
    }
    
    if (filterDto.createdBefore) {
      query.andWhere('question.createdAt <= :createdBefore', { createdBefore: filterDto.createdBefore });
    }
    
    if (filterDto.isTemplate !== undefined) {
      query.andWhere('question.isTemplate = :isTemplate', { isTemplate: filterDto.isTemplate });
    }
    
    if (filterDto.sortBy) {
      const direction = filterDto.sortDirection === 'DESC' ? 'DESC' : 'ASC';
      query.orderBy(`question.${filterDto.sortBy}`, direction);
    } else {
      query.orderBy('question.updatedAt', 'DESC');
    }
    
    if (filterDto.limit) {
      query.take(filterDto.limit);
    }
    
    if (filterDto.offset) {
      query.skip(filterDto.offset);
    }
    
    return query.getMany();
  }

  async findOne(id: string): Promise<Question> {
    const question = await this.questionRepository.findOne({
      where: { id },
      relations: ['tags', 'categories'],
    });
    
    if (!question) {
      throw new NotFoundException(`Question with ID ${id} not found`);
    }
    
    return question;
  }

  async update(id: string, updateQuestionDto: UpdateQuestionDto): Promise<Question> {
    const question = await this.findOne(id);
    
    // Create a new version before updating
    const changeNotes = updateQuestionDto.changeNotes || 'Updated question';
    await this.versionControlService.createVersion(question, changeNotes);
    
    // Increment version number
    question.currentVersion += 1;
    
    // Update the question
    Object.assign(question, updateQuestionDto);
    
    return this.questionRepository.save(question);
  }

  async remove(id: string): Promise<void> {
    const result = await this.questionRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Question with ID ${id} not found`);
    }
  }

  async getVersionHistory(id: string): Promise<QuestionVersion[]> {
    const question = await this.findOne(id);
    
    return this.questionVersionRepository.find({
      where: { questionId: id },
      order: { versionNumber: 'DESC' },
    });
  }

  async getVersion(id: string, versionNumber: number): Promise<QuestionVersion> {
    const version = await this.questionVersionRepository.findOne({
      where: { questionId: id, versionNumber },
    });
    
    if (!version) {
      throw new NotFoundException(
        `Version ${versionNumber} of question with ID ${id} not found`,
      );
    }
    
    return version;
  }

  async restoreVersion(id: string, versionNumber: number): Promise<Question> {
    const question = await this.findOne(id);
    const version = await this.getVersion(id, versionNumber);
    
    // Create a new version to mark the restoration
    await this.versionControlService.createVersion(
      question,
      `Restored from version ${versionNumber}`,
    );
    
    // Update the question with the data from the version
    question.title = version.title;
    question.description = version.description;
    question.type = version.type;
    question.content = version.content;
    question.conditionalLogic = version.conditionalLogic;
    question.currentVersion += 1;
    
    return this.questionRepository.save(question);
  }

  async duplicate(id: string): Promise<Question> {
    const original = await this.findOne(id);
    
    const duplicate = this.questionRepository.create({
      ...original,
      id: undefined, // Let the database generate a new ID
      title: `Copy of ${original.title}`,
      usageCount: 0,
      correctCount: 0,
      incorrectCount: 0,
      createdAt: undefined,
      updatedAt: undefined,
      currentVersion: 1,
    });
    
    // Clone tags and categories
    duplicate.tags = [...original.tags];
    duplicate.categories = [...original.categories];
    
    const saved = await this.questionRepository.save(duplicate);
    
    // Create initial version for the duplicate
    await this.versionControlService.createVersion(
      saved,
      `Duplicated from question ${original.id}`,
    );
    
    return saved;
  }

  async importQuestions(fileBuffer: Buffer): Promise<any> {
    // This would be implemented based on the file format
    // For now, return a placeholder response
    return { imported: 0, errors: [] };
  }

  async exportQuestions(questionIds: string[]): Promise<any> {
    const questions = await this.questionRepository.find({
      where: { id: In(questionIds) },
      relations: ['tags', 'categories'],
    });
    
    if (questions.length === 0) {
      throw new NotFoundException('No questions found with the provided IDs');
    }
    
    // This would be implemented to format the questions for export
    // For now, return the questions as-is
    return questions;
  }

  async getQuestionAnalytics(id: string): Promise<any> {
    const question = await this.findOne(id);
    return this.analyticsService.getQuestionEffectivenessById(id);
  }

  async addTag(questionId: string, tagId: string): Promise<Question> {
    const question = await this.findOne(questionId);
    const tag = await this.tagRepository.findOne({ where: { id: tagId } });
    
    if (!tag) {
      throw new NotFoundException(`Tag with ID ${tagId} not found`);
    }
    
    // Check if the tag is already associated with the question
    const tagExists = question.tags.some(t => t.id === tagId);
    if (!tagExists) {
      question.tags.push(tag);
      return this.questionRepository.save(question);
    }
    
    return question;
  }

  async removeTag(questionId: string, tagId: string): Promise<Question> {
    const question = await this.findOne(questionId);
    
    question.tags = question.tags.filter(tag => tag.id !== tagId);
    return this.questionRepository.save(question);
  }

  async addCategory(questionId: string, categoryId: string): Promise<Question> {
    const question = await this.findOne(questionId);
    const category = await this.categoryRepository.findOne({ where: { id: categoryId } });
    
    if (!category) {
      throw new NotFoundException(`Category with ID ${categoryId} not found`);
    }
    
    // Check if the category is already associated with the question
    const categoryExists = question.categories.some(c => c.id === categoryId);
    if (!categoryExists) {
      question.categories.push(category);
      return this.questionRepository.save(question);
    }
    
    return question;
  }

  async removeCategory(questionId: string, categoryId: string): Promise<Question> {
    const question = await this.findOne(questionId);
    
    question.categories = question.categories.filter(category => category.id !== categoryId);
    return this.questionRepository.save(question);
  }
}