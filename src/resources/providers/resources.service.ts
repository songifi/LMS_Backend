import { Injectable, NotFoundException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { type Repository, In } from "typeorm"
import { Resource } from "../entities/resource.entity"
import { ResourceCategory } from "../entities/resource-category.entity"
import { ResourceTag } from "../entities/resource-tag.entity"
import { ResourceVersion } from "../entities/resource-version.entity"
import type { CreateResourceDto } from "../dto/create-resource.dto"
import type { UpdateResourceDto } from "../dto/update-resource.dto"

@Injectable()
export class ResourcesService {
  constructor(
    @InjectRepository(Resource)
    private resourcesRepository: Repository<Resource>,
    @InjectRepository(ResourceCategory)
    private categoriesRepository: Repository<ResourceCategory>,
    @InjectRepository(ResourceTag)
    private tagsRepository: Repository<ResourceTag>,
    @InjectRepository(ResourceVersion)
    private versionsRepository: Repository<ResourceVersion>,
  ) {}

  async findAll(): Promise<Resource[]> {
    return this.resourcesRepository.find({
      relations: ["category", "tags"],
    })
  }

  async findOne(id: string): Promise<Resource> {
    const resource = await this.resourcesRepository.findOne({
      where: { id },
      relations: ["category", "tags", "versions"],
    })

    if (!resource) {
      throw new NotFoundException(`Resource with ID ${id} not found`)
    }

    return resource
  }

  async create(createResourceDto: CreateResourceDto): Promise<Resource> {
    const { categoryId, tagIds, ...resourceData } = createResourceDto

    // Find the category
    const category = await this.categoriesRepository.findOne({
      where: { id: categoryId },
    })

    if (!category) {
      throw new NotFoundException(`Category with ID ${categoryId} not found`)
    }

    // Find the tags
    let tags: ResourceTag[] = [] // <-- explicitly typed
    if (tagIds && tagIds.length > 0) {
      tags = await this.tagsRepository.findBy({ id: In(tagIds) })
    }
    

    // Create the resource
    const resource = this.resourcesRepository.create({
      ...resourceData,
      category,
      tags,
    })

    // Create the initial version
    const initialVersion = this.versionsRepository.create({
      versionNumber: 1,
      location: resourceData.location,
      resource,
    })

    // Save the resource first
    const savedResource = await this.resourcesRepository.save(resource)

    // Then save the version
    initialVersion.resource = savedResource
    await this.versionsRepository.save(initialVersion)

    return savedResource
  }

  async update(id: string, updateResourceDto: UpdateResourceDto): Promise<Resource> {
    const { categoryId, tagIds, ...resourceData } = updateResourceDto

    const resource = await this.findOne(id)

    // Update category if provided
    if (categoryId) {
      const category = await this.categoriesRepository.findOne({
        where: { id: categoryId },
      })

      if (!category) {
        throw new NotFoundException(`Category with ID ${categoryId} not found`)
      }

      resource.category = category
    }

    // Update tags if provided
    if (tagIds) {
      const tags = await this.tagsRepository.findBy({ id: In(tagIds) })
      resource.tags = tags
    }

    // Update other fields
    Object.assign(resource, resourceData)

    return this.resourcesRepository.save(resource)
  }

  async remove(id: string): Promise<void> {
    const result = await this.resourcesRepository.delete(id)

    if (result.affected === 0) {
      throw new NotFoundException(`Resource with ID ${id} not found`)
    }
  }

  async trackUsage(resourceId: string, userId: string, action: string, metadata?: Record<string, any>): Promise<void> {
    // This will be implemented in the usage service
  }
}
