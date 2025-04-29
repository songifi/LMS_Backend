import { Injectable, NotFoundException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import type { Repository } from "typeorm"
import { ResourceCategory } from "../entities/resource-category.entity"
import type { CreateCategoryDto } from "../dto/create-category.dto"

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(ResourceCategory)
    private categoriesRepository: Repository<ResourceCategory>,
  ) { }

  async findAll(): Promise<ResourceCategory[]> {
    return this.categoriesRepository.find({
      relations: ["parent", "children"],
    })
  }

  async findOne(id: string): Promise<ResourceCategory> {
    const category = await this.categoriesRepository.findOne({
      where: { id },
      relations: ["parent", "children", "resources"],
    })

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`)
    }

    return category
  }

  async create(createCategoryDto: CreateCategoryDto): Promise<ResourceCategory> {
    const { parentId, ...categoryData } = createCategoryDto

    const category = this.categoriesRepository.create(categoryData)

    if (parentId) {
      const parent = await this.categoriesRepository.findOne({
        where: { id: parentId },
      })

      if (!parent) {
        throw new NotFoundException(`Parent category with ID ${parentId} not found`)
      }

      category.parent = parent
    }

    return this.categoriesRepository.save(category)
  }

  async update(id: string, updateCategoryDto: CreateCategoryDto): Promise<ResourceCategory> {
    const { parentId, ...categoryData } = updateCategoryDto

    const category = await this.findOne(id)

    // Update parent if provided
    if (parentId) {
      const parent = await this.categoriesRepository.findOne({
        where: { id: parentId },
      })

      if (!parent) {
        throw new NotFoundException(`Parent category with ID ${parentId} not found`)
      }

      category.parent = parent
    }

    // Update other fields
    Object.assign(category, categoryData)

    return this.categoriesRepository.save(category)
  }

  async remove(id: string): Promise<void> {
    const result = await this.categoriesRepository.delete(id)

    if (result.affected === 0) {
      throw new NotFoundException(`Category with ID ${id} not found`)
    }
  }
}
