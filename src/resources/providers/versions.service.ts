import { Injectable, NotFoundException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import type { Repository } from "typeorm"
import { Resource } from "../entities/resource.entity"
import { ResourceVersion } from "../entities/resource-version.entity"
import type { CreateVersionDto } from "../dto/create-version.dto"

@Injectable()
export class VersionsService {
  constructor(
    @InjectRepository(Resource)
    private resourcesRepository: Repository<Resource>,
    @InjectRepository(ResourceVersion)
    private versionsRepository: Repository<ResourceVersion>,
  ) {}

  async createVersion(resourceId: string, createVersionDto: CreateVersionDto): Promise<ResourceVersion> {
    const resource = await this.resourcesRepository.findOne({
      where: { id: resourceId },
      relations: ["versions"],
    })

    if (!resource) {
      throw new NotFoundException(`Resource with ID ${resourceId} not found`)
    }

    // Determine the next version number
    const nextVersionNumber = resource.currentVersion + 1

    // Create the new version
    const newVersion = this.versionsRepository.create({
      ...createVersionDto,
      versionNumber: nextVersionNumber,
      resource,
    })

    // Update the resource's current version and location
    resource.currentVersion = nextVersionNumber
    resource.location = createVersionDto.location

    // Save both the resource and the new version
    await this.resourcesRepository.save(resource)
    return this.versionsRepository.save(newVersion)
  }

  async getVersions(resourceId: string): Promise<ResourceVersion[]> {
    const resource = await this.resourcesRepository.findOne({
      where: { id: resourceId },
      relations: ["versions"],
    })

    if (!resource) {
      throw new NotFoundException(`Resource with ID ${resourceId} not found`)
    }

    return resource.versions
  }

  async getVersion(resourceId: string, versionNumber: number): Promise<ResourceVersion> {
    const version = await this.versionsRepository.findOne({
      where: {
        resource: { id: resourceId },
        versionNumber,
      },
    })

    if (!version) {
      throw new NotFoundException(`Version ${versionNumber} of resource ${resourceId} not found`)
    }

    return version
  }
}
