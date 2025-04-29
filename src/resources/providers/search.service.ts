import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import type { Repository } from "typeorm"
import { Resource } from "../entities/resource.entity"
import type { SearchResourceDto } from "../dto/search-resource.dto"

@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(Resource)
    private resourcesRepository: Repository<Resource>,
  ) {}

  async search(
    searchDto: SearchResourceDto,
  ): Promise<{ items: Resource[]; total: number; page: number; limit: number }> {
    const { query, categoryIds, tagIds, author, page = 1, limit = 10 } = searchDto

    // Build the query
    const queryBuilder = this.resourcesRepository
      .createQueryBuilder("resource")
      .leftJoinAndSelect("resource.category", "category")
      .leftJoinAndSelect("resource.tags", "tag")

    // Apply filters
    if (query) {
      queryBuilder.andWhere("(resource.title ILIKE :query OR resource.description ILIKE :query)", {
        query: `%${query}%`,
      })
    }

    if (categoryIds && categoryIds.length > 0) {
      queryBuilder.andWhere("category.id IN (:...categoryIds)", { categoryIds })
    }

    if (tagIds && tagIds.length > 0) {
      queryBuilder.andWhere("tag.id IN (:...tagIds)", { tagIds })
    }

    if (author) {
      queryBuilder.andWhere("resource.author = :author", { author })
    }

    // Add pagination
    const total = await queryBuilder.getCount()

    queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy("resource.updatedAt", "DESC")

    const items = await queryBuilder.getMany()

    return {
      items,
      total,
      page,
      limit,
    }
  }
}
