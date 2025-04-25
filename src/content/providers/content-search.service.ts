import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, In } from 'typeorm';
import { Content } from '../entities/content.entity';
import { ContentMetadata } from '../entities/content-metadata.entity';
import { ContentSearchDto } from '../dto/content-search.dto';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class ContentSearchService {
  constructor(
    @InjectRepository(Content)
    private readonly contentRepository: Repository<Content>,
    @InjectRepository(ContentMetadata)
    private readonly metadataRepository: Repository<ContentMetadata>,
  ) {}

  async search(searchDto: ContentSearchDto, user: User): Promise<Content[]> {
    const query = searchDto.query?.trim();
    
    if (!query) {
      return [];
    }
    
    // Build search conditions
    const titleCondition = Like(`%${query}%`);
    const descriptionCondition = Like(`%${query}%`);
    
    // Basic search by title and description
    const contentResults = await this.contentRepository.find({
      where: [
        { title: titleCondition },
        { description: descriptionCondition },
      ],
      relations: ['creator', 'module', 'metadata'],
      take: searchDto.limit || 20,
    });
    
    // Search in metadata
    const metadataResults = await this.metadataRepository.find({
      where: [
        { key: titleCondition, isSearchable: true },
        { value: titleCondition, isSearchable: true },
      ],
      relations: ['content', 'content.creator', 'content.module', 'content.metadata'],
      take: searchDto.limit || 20,
    });
    
    // Extract content from metadata and combine results
    const metadataContents = metadataResults.map(meta => meta.content);
    
    // Combine and remove duplicates
    const combinedResults = [...contentResults, ...metadataContents];
    const uniqueResults = this.removeDuplicates(combinedResults);
    
    // Apply filters if provided
    let filteredResults = uniqueResults;
    
    if (Array.isArray(searchDto.contentTypes) && searchDto.contentTypes.length > 0) {
      filteredResults = filteredResults.filter(content =>
        searchDto.contentTypes!.includes(content.contentType)
      );
    }
    
    
    if (searchDto.moduleId) {
      filteredResults = filteredResults.filter(content => 
        content.module && content.module.id === searchDto.moduleId
      );
    }
    
    // Filter by access permissions
    const accessibleContents = await this.filterByAccessPermissions(filteredResults, user);
    
    return accessibleContents;
  }
  
  private removeDuplicates(contents: Content[]): Content[] {
    const uniqueMap = new Map<string, Content>();
    
    contents.forEach(content => {
      uniqueMap.set(content.id, content);
    });
    
    return Array.from(uniqueMap.values());
  }
  
  private async filterByAccessPermissions(contents: Content[], user: User): Promise<Content[]> {
    // This is a simplified version - in a real app, we'd check access rules
    // We'll include content that is either:
    // 1. Created by the current user, or
    // 2. Is published
    return contents.filter(content => {
      return content.isPublished || (content.creator && content.creator.id === user.id);
    });
  }
}