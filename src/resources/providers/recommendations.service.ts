import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository, In } from "typeorm"
import { Resource } from "../entities/resource.entity"
import { ResourceUsage } from "../entities/resource-usage.entity"
import { ResourceRecommendation } from "../entities/resource-recommendation.entity"

@Injectable()
export class RecommendationsService {
  constructor(
    @InjectRepository(Resource)
    private resourcesRepository: Repository<Resource>,
    @InjectRepository(ResourceUsage)
    private usageRepository: Repository<ResourceUsage>,
    @InjectRepository(ResourceRecommendation)
    private recommendationsRepository: Repository<ResourceRecommendation>,
  ) {}

  async getRecommendationsForUser(userId: string): Promise<ResourceRecommendation[]> {
    // Get the user's recommendations
    const recommendations = await this.recommendationsRepository.find({
      where: { userId },
      relations: ["resource", "resource.category", "resource.tags"],
      order: { score: "DESC" },
      take: 10,
    })

    // Mark recommendations as viewed
    if (recommendations.length > 0) {
      await this.recommendationsRepository.update(
        { id: In(recommendations.map((r) => r.id)) },
        { viewed: true }
      )
    }

    return recommendations
  }

  async generateRecommendations(): Promise<void> {
    // This would typically be run as a scheduled job

    // 1. Get all users who have interacted with resources
    const users = await this.usageRepository
      .createQueryBuilder("usage")
      .select("DISTINCT usage.userId", "userId")
      .getRawMany()

    // 2. For each user, generate recommendations
    for (const user of users) {
      await this.generateRecommendationsForUser(user.userId)
    }
  }

  private async generateRecommendationsForUser(userId: string): Promise<void> {
    // 1. Get the resources the user has interacted with
    const userInteractions = await this.usageRepository.find({
      where: { userId },
      relations: ["resource", "resource.category", "resource.tags"],
    })

    if (userInteractions.length === 0) {
      return // No interactions, no recommendations to generate
    }

    // 2. Get the categories and tags the user has shown interest in
    const categoryIds = new Set(
      userInteractions.map((i) => i.resource.category?.id).filter(Boolean)
    )
    const tagIds = new Set(
      userInteractions
        .flatMap((i) => i.resource.tags?.map((t) => t.id) || [])
        .filter(Boolean)
    )

    // 3. Find resources with similar categories and tags that the user hasn't interacted with
    const userResourceIds = userInteractions.map((i) => i.resource.id)

    const recommendedResources = await this.resourcesRepository
      .createQueryBuilder("resource")
      .leftJoinAndSelect("resource.category", "category")
      .leftJoinAndSelect("resource.tags", "tag")
      .where("resource.id NOT IN (:...userResourceIds)", { userResourceIds })
      .andWhere(
        "(category.id IN (:...categoryIds) OR tag.id IN (:...tagIds))",
        {
          categoryIds: Array.from(categoryIds),
          tagIds: Array.from(tagIds),
        }
      )
      .getMany()

    // 4. Calculate a score for each recommendation
    const recommendations = recommendedResources.map((resource) => {
      let score = resource.category && categoryIds.has(resource.category.id) ? 1 : 0

      if (resource.tags) {
        for (const tag of resource.tags) {
          if (tagIds.has(tag.id)) {
            score += 0.5
          }
        }
      }

      return {
        userId,
        resource,
        score,
        reason: "Based on your previous activity",
      }
    })

    // 5. Save the top recommendations
    const topRecommendations = recommendations.sort((a, b) => b.score - a.score).slice(0, 10)

    // Delete existing recommendations for this user
    await this.recommendationsRepository.delete({ userId })

    // Save new recommendations
    for (const rec of topRecommendations) {
      const recommendation = this.recommendationsRepository.create({
        userId: rec.userId,
        resource: rec.resource,
        score: rec.score,
        reason: rec.reason,
        viewed: false,
      })

      await this.recommendationsRepository.save(recommendation)
    }
  }
}
