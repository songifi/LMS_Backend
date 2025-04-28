import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import type { Repository } from "typeorm";
import { GradeScale } from "../entities/grade-scale.entity";
import type { CreateGradeScaleDto } from "../dto/create-grade-scale.dto";
import type { UpdateGradeScaleDto } from "../dto/update-grade-scale.dto";

@Injectable()
export class GradeScaleService {
  constructor(
    @InjectRepository(GradeScale)
    private gradeScaleRepository: Repository<GradeScale>,
  ) {}

  async create(createGradeScaleDto: CreateGradeScaleDto): Promise<GradeScale> {
    this.validateScaleData(createGradeScaleDto.scaleData);

    const gradeScale = this.gradeScaleRepository.create({
      name: createGradeScaleDto.name,
      description: createGradeScaleDto.description,
      scaleData: createGradeScaleDto.scaleData,
      isDefault: createGradeScaleDto.isDefault || false,
    });

    if (gradeScale.isDefault) {
      await this.unsetDefaultScales();
    }

    return this.gradeScaleRepository.save(gradeScale);
  }

  private validateScaleData(scaleData: any[]): void {
    // Check for overlapping ranges
    for (let i = 0; i < scaleData.length; i++) {
      for (let j = i + 1; j < scaleData.length; j++) {
        const a = scaleData[i];
        const b = scaleData[j];

        if (
          (a.lowerBound <= b.upperBound && a.upperBound >= b.lowerBound) ||
          (b.lowerBound <= a.upperBound && b.upperBound >= a.lowerBound)
        ) {
          throw new Error(`Overlapping grade ranges detected between ${a.letter} and ${b.letter}`);
        }
      }
    }

    // Check for valid bounds
    for (const entry of scaleData) {
      if (entry.lowerBound > entry.upperBound) {
        throw new Error(
          `Invalid range for grade ${entry.letter}: lower bound (${entry.lowerBound}) is greater than upper bound (${entry.upperBound})`,
        );
      }
      if (entry.lowerBound < 0 || entry.upperBound > 100) {
        throw new Error(`Grade bounds must be between 0 and 100 for grade ${entry.letter}`);
      }
    }
  }

  private async unsetDefaultScales(): Promise<void> {
    const defaultScales = await this.gradeScaleRepository.find({
      where: { isDefault: true },
    });

    for (const scale of defaultScales) {
      scale.isDefault = false;
      await this.gradeScaleRepository.save(scale);
    }
  }

  async findAll(): Promise<GradeScale[]> {
    return this.gradeScaleRepository.find({
      where: { isActive: true },
    });
  }

  async findOne(id: string): Promise<GradeScale> {
    const scale = await this.gradeScaleRepository.findOne({
      where: { id },
    });

    if (!scale) {
      throw new NotFoundException(`Grade scale with ID ${id} not found`);
    }

    return scale;
  }

  async findDefault(): Promise<GradeScale> {
    const scale = await this.gradeScaleRepository.findOne({
      where: { isDefault: true, isActive: true },
    });

    if (!scale) {
      throw new NotFoundException("No default grade scale found");
    }

    return scale;
  }

  async update(id: string, updateGradeScaleDto: UpdateGradeScaleDto): Promise<GradeScale> {
    const scale = await this.findOne(id);

    if (updateGradeScaleDto.scaleData) {
      this.validateScaleData(updateGradeScaleDto.scaleData);
    }

    Object.assign(scale, {
      name: updateGradeScaleDto.name !== undefined ? updateGradeScaleDto.name : scale.name,
      description: updateGradeScaleDto.description !== undefined ? updateGradeScaleDto.description : scale.description,
      scaleData: updateGradeScaleDto.scaleData !== undefined ? updateGradeScaleDto.scaleData : scale.scaleData,
      isDefault: updateGradeScaleDto.isDefault !== undefined ? updateGradeScaleDto.isDefault : scale.isDefault,
    });

    if (updateGradeScaleDto.isDefault && scale.isDefault !== true) {
      await this.unsetDefaultScales();
    }

    return this.gradeScaleRepository.save(scale);
  }

  async remove(id: string): Promise<void> {
    const scale = await this.findOne(id);
    scale.isActive = false;
    await this.gradeScaleRepository.save(scale);
  }

  getLetterGrade(percentage: number, scaleData: any[]): string {
    for (const entry of scaleData) {
      if (percentage >= entry.lowerBound && percentage <= entry.upperBound) {
        return entry.letter;
      }
    }
    return "N/A";
  }
}
