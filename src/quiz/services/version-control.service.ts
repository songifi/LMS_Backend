import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Question } from '../entities/question.entity';
import { QuestionVersion } from '../entities/question-version.entity';

@Injectable()
export class VersionControlService {
  constructor(
    @InjectRepository(QuestionVersion)
    private questionVersionRepository: Repository<QuestionVersion>,
  ) {}

  async createVersion(question: Question, changeNotes: string): Promise<QuestionVersion> {
    const version = this.questionVersionRepository.create({
      questionId: question.id,
      versionNumber: question.currentVersion,
      title: question.title,
      description: question.description,
      type: question.type,
      content: question.content,
      conditionalLogic: question.conditionalLogic,
      difficultyMetrics: question.difficultyMetrics,
      metadata: question.metadata,
      changeNotes,
      createdBy: question.updatedBy || question.createdBy,
    });
    
    return this.questionVersionRepository.save(version);
  }

  async getVersions(questionId: string): Promise<QuestionVersion[]> {
    return this.questionVersionRepository.find({
      where: { questionId },
      order: { versionNumber: 'DESC' },
    });
  }

  async getVersion(questionId: string, versionNumber: number): Promise<QuestionVersion> {
    return this.questionVersionRepository.findOne({
      where: { questionId, versionNumber },
    });
  }

  async compareVersions(
    questionId: string,
    versionNumber1: number,
    versionNumber2: number,
  ): Promise<any> {
    const version1 = await this.getVersion(questionId, versionNumber1);
    const version2 = await this.getVersion(questionId, versionNumber2);
    
    if (!version1 || !version2) {
      throw new Error('One or both versions not found');
    }
    
    // Compare the versions and return the differences
    // This is a simplified implementation
    const changes = {
      title: version1.title !== version2.title,
      description: version1.description !== version2.description,
      type: version1.type !== version2.type,
      content: JSON.stringify(version1.content) !== JSON.stringify(version2.content),
      conditionalLogic: JSON.stringify(version1.conditionalLogic) !== JSON.stringify(version2.conditionalLogic),
      difficultyMetrics: JSON.stringify(version1.difficultyMetrics) !== JSON.stringify(version2.difficultyMetrics),
      metadata: JSON.stringify(version1.metadata) !== JSON.stringify(version2.metadata),
    };
    
    return {
      version1,
      version2,
      changes,
    };
  }
}