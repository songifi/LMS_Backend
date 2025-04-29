import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LearningPath } from './entities/learning-path.entity';
import { LearnerProgress } from './entities/learner-progress.entity';
import { ContentRecommendation } from './entities/content-recommendation.entity';
import { CompetencyAssessment } from './entities/competency-assessment.entity';
import { PathNode } from './entities/path-node.entity';
import { CreateLearningPathDto } from './dto/create-learning-path.dto';
import { UpdateLearningPathDto } from './dto/update-learning-path.dto';
import { SubmitAssessmentDto } from './dto/submit-assessment.dto';

@Injectable()
export class LearningPathService {
  constructor(
    @InjectRepository(LearningPath)
    private lpRepo: Repository<LearningPath>,

    @InjectRepository(PathNode)
    private nodeRepo: Repository<PathNode>,

    @InjectRepository(LearnerProgress)
    private progressRepo: Repository<LearnerProgress>,

    @InjectRepository(ContentRecommendation)
    private recommendationRepo: Repository<ContentRecommendation>,

    @InjectRepository(CompetencyAssessment)
    private assessmentRepo: Repository<CompetencyAssessment>,
  ) {}

  async getAllLearningPaths() {
    return this.lpRepo.find({ relations: ['nodes'] });
  }

  async createLearningPath(dto: CreateLearningPathDto): Promise<LearningPath> {
    const path = this.lpRepo.create(dto);
    return await this.lpRepo.save(path);
  }

  async getLearningPathById(id: string): Promise<LearningPath> {
    const path = await this.lpRepo.findOne({ where: { id }, relations: ['nodes'] });
    if (!path) throw new NotFoundException('Learning path not found');
    return path;
  }

  async updateLearningPath(id: string, dto: UpdateLearningPathDto) {
    await this.lpRepo.update(id, dto);
    return this.getLearningPathById(id);
  }

  async getLearnerProgress(pathId: string, learnerId: string) {
    return this.progressRepo.findOne({
      where: { learnerId },
      relations: ['currentNode'],
    });
  }

  async submitAssessment(pathId: string, dto: SubmitAssessmentDto) {
    const progress = await this.progressRepo.findOne({
      where: { learnerId: dto.learnerId },
    });

    if (!progress) {
      throw new NotFoundException('Progress not found for this learner and path');
    }
    
    progress.score = dto.score;
    return await this.progressRepo.save(progress);
  }

  async getRecommendations(learnerId: string): Promise<ContentRecommendation[]> {
    return this.recommendationRepo.find({ where: { learnerId } });
  }
}
