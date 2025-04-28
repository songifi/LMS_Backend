import { Injectable, NotFoundException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { GradeCurve } from "../entities/grade-curve.entity"
import { CreateGradeCurveDto } from "../dto/create-grade-curve.dto"
import { UpdateGradeCurveDto } from "../dto/update-grade-curve.dto"
import { Assessment } from "src/assessment/entities/assessment.entity"

@Injectable()
export class GradeCurveService {
  constructor(
    @InjectRepository(GradeCurve)
    private gradeCurveRepository: Repository<GradeCurve>,
    @InjectRepository(Assessment)
    private assessmentRepository: Repository<Assessment>,
  ) {}

  async create(createGradeCurveDto: CreateGradeCurveDto): Promise<GradeCurve> {
    let assessment: Assessment | undefined

    if (createGradeCurveDto.assessmentId) {
        assessment = (await this.assessmentRepository.findOne({ where: { id: createGradeCurveDto.assessmentId } })) || undefined
      if (!assessment) {
        throw new NotFoundException(`Assessment with ID ${createGradeCurveDto.assessmentId} not found`)
      }
    }

    const gradeCurve = this.gradeCurveRepository.create({
      name: createGradeCurveDto.name,
      description: createGradeCurveDto.description,
      curveType: createGradeCurveDto.curveType,
      curveParameters: createGradeCurveDto.curveParameters,
      ...(assessment && { assessment }), // <- only add if exists
    })

    return this.gradeCurveRepository.save(gradeCurve)
  }

  async findAll(assessmentId?: string): Promise<GradeCurve[]> {
    const query = this.gradeCurveRepository
      .createQueryBuilder("curve")
      .leftJoinAndSelect("curve.assessment", "assessment")
      .where("curve.isActive = :isActive", { isActive: true })

    if (assessmentId) {
      query.andWhere("assessment.id = :assessmentId", { assessmentId })
    }

    return query.getMany()
  }

  async findOne(id: string): Promise<GradeCurve> {
    const curve = await this.gradeCurveRepository.findOne({
      where: { id },
      relations: ["assessment"],
    })

    if (!curve) {
      throw new NotFoundException(`Grade curve with ID ${id} not found`)
    }

    return curve
  }

  async update(id: string, updateGradeCurveDto: UpdateGradeCurveDto): Promise<GradeCurve> {
    const curve = await this.findOne(id)

    if (updateGradeCurveDto.assessmentId) {
      const assessment = await this.assessmentRepository.findOne({ where: { id: updateGradeCurveDto.assessmentId } })
      if (!assessment) {
        throw new NotFoundException(`Assessment with ID ${updateGradeCurveDto.assessmentId} not found`)
      }
      curve.assessment = assessment
    }

    Object.assign(curve, {
      name: updateGradeCurveDto.name !== undefined ? updateGradeCurveDto.name : curve.name,
      description: updateGradeCurveDto.description !== undefined ? updateGradeCurveDto.description : curve.description,
      curveType: updateGradeCurveDto.curveType !== undefined ? updateGradeCurveDto.curveType : curve.curveType,
      curveParameters:
        updateGradeCurveDto.curveParameters !== undefined ? updateGradeCurveDto.curveParameters : curve.curveParameters,
    })

    return this.gradeCurveRepository.save(curve)
  }

  async remove(id: string): Promise<void> {
    const curve = await this.findOne(id)
    curve.isActive = false
    await this.gradeCurveRepository.save(curve)
  }

  applyCurve(rawScore: number, possiblePoints: number, curve: GradeCurve): number {
    const percentage = (rawScore / possiblePoints) * 100

    switch (curve.curveType) {
      case "linear":
        return this.applyLinearCurve(percentage, curve.curveParameters)
      case "normal":
        return this.applyNormalCurve(percentage, curve.curveParameters)
      case "square_root":
        return this.applySquareRootCurve(percentage, curve.curveParameters)
      case "custom":
        return this.applyCustomCurve(percentage, curve.curveParameters)
      default:
        return percentage
    }
  }

  private applyLinearCurve(percentage: number, params: any): number {
    const adjustment = params.adjustment || 0
    return Math.min(100, Math.max(0, percentage + adjustment))
  }

  private applyNormalCurve(percentage: number, params: any): number {
    const mean = params.mean || 75
    const stdDev = params.standardDeviation || 10

    const zScore = (percentage - mean) / stdDev
    const percentile = this.normalCDF(zScore)
    return Math.min(100, Math.max(0, percentile * 100))
  }

  private normalCDF(x: number): number {
    const t = 1 / (1 + 0.2316419 * Math.abs(x))
    const d = 0.3989423 * Math.exp((-x * x) / 2)
    const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))))
    return x > 0 ? 1 - p : p
  }

  private applySquareRootCurve(percentage: number, params: any): number {
    const adjustment = params.adjustment || 0
    return Math.min(100, Math.max(0, Math.sqrt(percentage) * 10 + adjustment))
  }

  private applyCustomCurve(percentage: number, params: any): number {
    const adjustment = params.adjustment || 0
    return Math.min(100, Math.max(0, percentage + adjustment))
  }
}
