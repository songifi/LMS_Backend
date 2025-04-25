import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QuestionBank } from '../entities/question-bank.entity';
import { Question } from '../entities/question.entity';
import { User } from 'src/user/entities/user.entity';
import { CreateQuestionBankDto } from '../dto/create-question-bank.dto';

@Injectable()
export class QuestionBankService {
  constructor(
    @InjectRepository(QuestionBank)
    private questionBankRepository: Repository<QuestionBank>,
    @InjectRepository(Question)
    private questionRepository: Repository<Question>,
  ) {}

  async create(createQuestionBankDto: CreateQuestionBankDto, creator: User): Promise<QuestionBank> {
    if (Array.isArray(createQuestionBankDto)) {
      throw new BadRequestException('createQuestionBankDto should not be an array');
    }

    const questionBank = this.questionBankRepository.create({
      ...createQuestionBankDto,
      creator,
    });

    return await this.questionBankRepository.save(questionBank);
  }

  async findAll(userId: string, includeShared = false): Promise<QuestionBank[]> {
    const numericUserId = parseInt(userId, 10);

    const qb = this.questionBankRepository.createQueryBuilder('qb')
      .leftJoinAndSelect('qb.creator', 'creator')
      .leftJoinAndSelect('qb.questions', 'questions');

    if (includeShared) {
      qb.where('qb.creatorId = :userId OR qb.isPrivate = false', { userId: numericUserId });
    } else {
      qb.where('qb.creatorId = :userId OR (qb.isPrivate = false AND qb.creatorId != :userId)', {
        userId: numericUserId,
      });
    }

    return qb.getMany();
  }

  async findOne(id: string): Promise<QuestionBank> {
    const questionBank = await this.questionBankRepository.findOne({
      where: { id },
      relations: ['questions', 'creator'],
    });

    if (!questionBank) {
      throw new NotFoundException(`Question bank with ID ${id} not found`);
    }

    return questionBank;
  }

  async addQuestion(bankId: string, questionDto: Partial<Question>): Promise<Question> {
    const questionBank = await this.findOne(bankId);

    const question = this.questionRepository.create({
      ...questionDto,
      questionBank,
    });

    return this.questionRepository.save(question);
  }

  async removeQuestion(questionId: string): Promise<void> {
    const question = await this.questionRepository.findOne({
      where: { id: questionId },
      relations: ['questionBank'],
    });

    if (!question) {
      throw new NotFoundException(`Question with ID ${questionId} not found`);
    }

    question.questionBank = null;
    await this.questionRepository.save(question);
  }

  async update(id: string, updateQuestionBankDto: Partial<CreateQuestionBankDto>): Promise<QuestionBank> {
    const questionBank = await this.findOne(id);
    Object.assign(questionBank, updateQuestionBankDto);
    return this.questionBankRepository.save(questionBank);
  }

  async remove(id: string): Promise<void> {
    const questionBank = await this.findOne(id);
    await this.questionBankRepository.remove(questionBank);
  }
}
