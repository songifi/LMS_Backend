import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContentBlock } from '../entities/content-block.entity';
import { CreateContentBlockDto } from '../dto/create-content-block.dto';

@Injectable()
export class ContentBlockService {
  constructor(
    @InjectRepository(ContentBlock)
    private contentBlockRepository: Repository<ContentBlock>,
  ) {}

  async create(createDto: CreateContentBlockDto): Promise<ContentBlock> {
    const newBlock = this.contentBlockRepository.create(createDto);
    return this.contentBlockRepository.save(newBlock);
  }

  async findByTemplateId(templateId: string): Promise<ContentBlock[]> {
    return this.contentBlockRepository.find({
      where: { templateId },
    });
  }

  async findOne(id: string): Promise<ContentBlock> {
    const block = await this.contentBlockRepository.findOne({
      where: { id },
    });
    
    if (!block) {
      throw new NotFoundException(`Content block with ID ${id} not found`);
    }
    
    return block;
  }

  async update(id: string, updateDto: Partial<CreateContentBlockDto>): Promise<ContentBlock> {
    const block = await this.findOne(id);
    Object.assign(block, updateDto);
    return this.contentBlockRepository.save(block);
  }

  async remove(id: string): Promise<void> {
    const block = await this.findOne(id);
    await this.contentBlockRepository.remove(block);
  }

  async deleteByTemplateId(templateId: string): Promise<void> {
    await this.contentBlockRepository.delete({ templateId });
  }

  async findReusableBlocks(): Promise<ContentBlock[]> {
    return this.contentBlockRepository.find({
      where: { isReusable: true },
    });
  }
}
