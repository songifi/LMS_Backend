import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import type { Repository } from "typeorm";
import { Gradebook } from "../entities/gradebook.entity";
import type { CreateGradebookDto } from "../dto/create-gradebook.dto";
import type { UpdateGradebookDto } from "../dto/update-gradebook.dto";
import { GradeScale } from "../entities/grade-scale.entity";

@Injectable()
export class GradebookService {
  constructor(
    @InjectRepository(Gradebook)
    private gradebookRepository: Repository<Gradebook>,
    @InjectRepository(GradeScale)
    private gradeScaleRepository: Repository<GradeScale>,
  ) {}

  async create(createGradebookDto: CreateGradebookDto): Promise<Gradebook> {
    const gradeScale = await this.gradeScaleRepository.findOne({ where: { id: createGradebookDto.gradeScaleId } });
    if (!gradeScale) {
      throw new NotFoundException(`Grade scale with ID ${createGradebookDto.gradeScaleId} not found`);
    }

    const gradebook = this.gradebookRepository.create({
      gradeScale,
      allowDropLowest: createGradebookDto.allowDropLowest ?? false,
      showLetterGrades: createGradebookDto.showLetterGrades ?? false,
      showPercentages: createGradebookDto.showPercentages ?? true,
      allowExtraCredit: createGradebookDto.allowExtraCredit ?? false,
      maxExtraCreditPercentage: createGradebookDto.maxExtraCreditPercentage ?? 100,
      isWeighted: createGradebookDto.isWeighted ?? false,
      isActive: true,
    });

    return this.gradebookRepository.save(gradebook);
  }

  async findAll(): Promise<Gradebook[]> {
    return this.gradebookRepository.find({
      where: { isActive: true },
      relations: ["gradeScale"],
    });
  }

  async findOne(id: string): Promise<Gradebook> {
    const gradebook = await this.gradebookRepository.findOne({
      where: { id },
      relations: ["gradeScale", "categories"],
    });

    if (!gradebook) {
      throw new NotFoundException(`Gradebook with ID ${id} not found`);
    }

    return gradebook;
  }

  async update(id: string, updateGradebookDto: UpdateGradebookDto): Promise<Gradebook> {
    const gradebook = await this.findOne(id);

    if (updateGradebookDto.gradeScaleId) {
      const gradeScale = await this.gradeScaleRepository.findOne({ where: { id: updateGradebookDto.gradeScaleId } });
      if (!gradeScale) {
        throw new NotFoundException(`Grade scale with ID ${updateGradebookDto.gradeScaleId} not found`);
      }
      gradebook.gradeScale = gradeScale;
    }

    Object.assign(gradebook, {
      allowDropLowest: updateGradebookDto.allowDropLowest ?? gradebook.allowDropLowest,
      showLetterGrades: updateGradebookDto.showLetterGrades ?? gradebook.showLetterGrades,
      showPercentages: updateGradebookDto.showPercentages ?? gradebook.showPercentages,
      allowExtraCredit: updateGradebookDto.allowExtraCredit ?? gradebook.allowExtraCredit,
      maxExtraCreditPercentage: updateGradebookDto.maxExtraCreditPercentage ?? gradebook.maxExtraCreditPercentage,
      isWeighted: updateGradebookDto.isWeighted ?? gradebook.isWeighted,
    });

    return this.gradebookRepository.save(gradebook);
  }

  async remove(id: string): Promise<void> {
    const gradebook = await this.findOne(id);
    gradebook.isActive = false;
    await this.gradebookRepository.save(gradebook);
  }

  async getGradeScale(gradebookId: string): Promise<GradeScale> {
    const gradebook = await this.findOne(gradebookId);
    return gradebook.gradeScale;
  }
}
