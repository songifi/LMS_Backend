import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AssessmentStructure } from '../entities/assessment-structure.entity';
import { CreateAssessmentStructureDto } from '../dto/create-assessment-structure.dto';

@Injectable()
export class AssessmentStructureService {
  constructor(
    @InjectRepository(AssessmentStructure)
    private assessmentStructureRepository: Repository<AssessmentStructure>,
  ) {}

  async create(createDto: CreateAssessmentStructureDto): Promise<AssessmentStructure> {
    const newAssessment = this.assessmentStructureRepository.create(createDto);
    return this.assessmentStructureRepository.save(newAssessment);
  }

  async findByTemplateId(templateId: string): Promise<AssessmentStructure[]> {
    return this.assessmentStructureRepository.find({
      where: { templateId },
    });
  }

  async findOne(id: string): Promise<AssessmentStructure> {
    const assessment = await this.assessmentStructureRepository.findOne({
      where: { id },
    });
    
    if (!assessment) {
      throw new NotFoundException(`Assessment structure with ID ${id} not found`);
    }
    
    return assessment;
  }

  async update(id: string, updateDto: Partial<CreateAssessmentStructureDto>): Promise<AssessmentStructure> {
    const assessment = await this.findOne(id);
    Object.assign(assessment, updateDto);
    return this.assessmentStructureRepository.save(assessment);
  }

  async remove(id: string): Promise<void> {
    const assessment = await this.findOne(id);
    await this.assessmentStructureRepository.remove(assessment);
  }

  async deleteByTemplateId(templateId: string): Promise<void> {
    await this.assessmentStructureRepository.delete({ templateId });
  }

  async validateTotalWeight(templateId: string): Promise<boolean> {
    const assessments = await this.findByTemplateId(templateId);
    const totalWeight = assessments.reduce((sum, item) => sum + item.weightPercentage, 0);
    return totalWeight === 100;
  }
}
