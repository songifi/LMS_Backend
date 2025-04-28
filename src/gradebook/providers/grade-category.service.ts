import { Injectable, NotFoundException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import type { Repository } from "typeorm"
import { GradeCategory } from "../entities/grade-category.entity"
import type { CreateGradeCategoryDto } from "../dto/create-grade-category.dto"
import type { UpdateGradeCategoryDto } from "../dto/update-grade-category.dto"

@Injectable()
export class GradeCategoryService {
  constructor(
    @InjectRepository(GradeCategory)
    private readonly gradeCategoryRepository: Repository<GradeCategory>,
  ) {}

  async create(createGradeCategoryDto: CreateGradeCategoryDto): Promise<GradeCategory> {
    let parent: GradeCategory | undefined = undefined
    if (createGradeCategoryDto.parentId) {
      const foundParent = await this.gradeCategoryRepository.findOne({ where: { id: createGradeCategoryDto.parentId } })
      if (!foundParent) {
        throw new NotFoundException(`Parent category with ID ${createGradeCategoryDto.parentId} not found`)
      }
      parent = foundParent
    }
    

    const category = this.gradeCategoryRepository.create({
      name: createGradeCategoryDto.name,
      description: createGradeCategoryDto.description,
      weight: createGradeCategoryDto.weight,
      parent, // now undefined if no parent, not null
      displayOrder: createGradeCategoryDto.displayOrder || 0,
      dropLowest: createGradeCategoryDto.dropLowest || false,
      numberOfLowestToDrops: createGradeCategoryDto.numberOfLowestToDrops || 0,
      isActive: true,
    })

    return this.gradeCategoryRepository.save(category)
  }

  async findAll(): Promise<GradeCategory[]> {
    const query = this.gradeCategoryRepository
      .createQueryBuilder("category")
      .leftJoinAndSelect("category.parent", "parent")
      .where("category.isActive = :isActive", { isActive: true })

    return query.getMany()
  }

  async findOne(id: string): Promise<GradeCategory> {
    const category = await this.gradeCategoryRepository.findOne({
      where: { id },
      relations: ["parent", "children"],
    })

    if (!category) {
      throw new NotFoundException(`Grade category with ID ${id} not found`)
    }

    return category
  }

  async update(id: string, updateGradeCategoryDto: UpdateGradeCategoryDto): Promise<GradeCategory> {
    const category = await this.findOne(id)

    if (updateGradeCategoryDto.parentId) {
      const parent = await this.gradeCategoryRepository.findOne({ where: { id: updateGradeCategoryDto.parentId } })
      if (!parent) {
        throw new NotFoundException(`Parent category with ID ${updateGradeCategoryDto.parentId} not found`)
      }
      category.parent = parent
    }

    Object.assign(category, {
      name: updateGradeCategoryDto.name ?? category.name,
      description: updateGradeCategoryDto.description ?? category.description,
      weight: updateGradeCategoryDto.weight ?? category.weight,
      displayOrder: updateGradeCategoryDto.displayOrder ?? category.displayOrder,
      dropLowest: updateGradeCategoryDto.dropLowest ?? category.dropLowest,
      numberOfLowestToDrops: updateGradeCategoryDto.numberOfLowestToDrops ?? category.numberOfLowestToDrops,
    })

    return this.gradeCategoryRepository.save(category)
  }

  async remove(id: string): Promise<void> {
    const category = await this.findOne(id)
    category.isActive = false
    await this.gradeCategoryRepository.save(category)
  }

  async validateCategoryWeights(): Promise<boolean> {
    const categories = await this.gradeCategoryRepository.find({
      where: {
        parent: undefined, // instead of parent: null
        isActive: true,
      },
    })

    const totalWeight = categories.reduce((sum, category) => sum + category.weight, 0)
    return Math.abs(totalWeight - 100) < 0.01 // Allow for small floating point errors
  }
}
