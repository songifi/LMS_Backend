import { Injectable } from "@nestjs/common"
import type { CacheService } from "../cache/services/cache.service"
import type { CacheInvalidationService } from "../cache/services/cache-invalidation.service"
import { ContentType } from "../cache/interfaces/cache.interfaces"
import { Cached } from "../cache/decorators/cached.decorator"

@Injectable()
export class CourseService {
  constructor(
    private readonly cacheService: CacheService,
    private readonly cacheInvalidationService: CacheInvalidationService,
  ) {}

  /**
   * Get a course by ID with caching
   */
  @Cached({
    prefix: "course",
    contentType: ContentType.COURSE,
    idFromArgs: (args) => args[0], // First argument is the ID
  })
  async getCourse(id: string) {
    // This method is cached using the decorator
    // If not in cache, this code will execute
    return this.fetchCourseFromDatabase(id)
  }

  /**
   * Get courses with pagination and filtering
   */
  async getCourses(page: number, limit: number, filters: Record<string, any>) {
    // Try to get from cache first
    const cachedCourses = await this.cacheService.get({
      prefix: "course:list",
      id: "all",
      params: { page, limit, ...filters },
    })

    if (cachedCourses) {
      return cachedCourses
    }

    // If not in cache, fetch from database
    const courses = await this.fetchCoursesFromDatabase(page, limit, filters)

    // Store in cache
    await this.cacheService.set(
      { prefix: "course:list", id: "all", params: { page, limit, ...filters } },
      courses,
      ContentType.COURSE,
    )

    return courses
  }

  /**
   * Create a new course
   */
  async createCourse(data: any) {
    // Create in database
    const course = await this.createCourseInDatabase(data)

    // Invalidate course list cache
    await this.cacheInvalidationService.invalidateByPrefix("course:list")

    return course
  }

  /**
   * Update a course
   */
  async updateCourse(id: string, data: any) {
    // Update in database
    const course = await this.updateCourseInDatabase(id, data)

    // Invalidate specific course cache and its dependencies
    await this.cacheInvalidationService.invalidateEntityWithDependencies("course", id)

    return course
  }

  /**
   * Delete a course
   */
  async deleteCourse(id: string) {
    // Delete from database
    await this.deleteCourseFromDatabase(id)

    // Invalidate specific course cache and course list
    await this.cacheInvalidationService.invalidateEntityWithDependencies("course", id)
    await this.cacheInvalidationService.invalidateByPrefix("course:list")
  }

  // Mock database methods
  private async fetchCourseFromDatabase(id: string) {
    // Simulate database query
    return { id, title: `Course ${id}`, description: "Course description" }
  }

  private async fetchCoursesFromDatabase(page: number, limit: number, filters: Record<string, any>) {
    // Simulate database query
    const courses = []
    for (let i = 0; i < limit; i++) {
      courses.push({
        id: `${(page - 1) * limit + i + 1}`,
        title: `Course ${(page - 1) * limit + i + 1}`,
        description: "Course description",
      })
    }
    return { data: courses, total: 100, page, limit }
  }

  private async createCourseInDatabase(data: any) {
    // Simulate database insert
    return { id: Date.now().toString(), ...data }
  }

  private async updateCourseInDatabase(id: string, data: any) {
    // Simulate database update
    return { id, ...data }
  }

  private async deleteCourseFromDatabase(id: string) {
    // Simulate database delete
    return true
  }
}
