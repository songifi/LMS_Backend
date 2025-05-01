import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Algorithm, AlgorithmStatus } from './entities/algorithm.entity';
import { CreateAlgorithmDto } from './dto/create-algorithm.dto';
import { UpdateAlgorithmDto } from './dto/update-algorithm.dto';

@Injectable()
export class AlgorithmsService {
  constructor(
    @InjectRepository(Algorithm)
    private algorithmRepository: Repository<Algorithm>,
  ) {}

  async create(createAlgorithmDto: CreateAlgorithmDto): Promise<Algorithm> {
    const algorithm = this.algorithmRepository.create({
      ...createAlgorithmDto,
      status: createAlgorithmDto.status || AlgorithmStatus.TESTING,
    });
    
    return this.algorithmRepository.save(algorithm);
  }

  async findAll(): Promise<Algorithm[]> {
    return this.algorithmRepository.find();
  }

  async findActive(): Promise<Algorithm[]> {
    return this.algorithmRepository.find({
      where: { status: AlgorithmStatus.ACTIVE },
    });
  }

  async findOne(id: string): Promise<Algorithm> {
    const algorithm = await this.algorithmRepository.findOne({
      where: { id },
    });

    if (!algorithm) {
      throw new NotFoundException(`Algorithm with ID ${id} not found`);
    }

    return algorithm;
  }

  async update(id: string, updateAlgorithmDto: UpdateAlgorithmDto): Promise<Algorithm> {
    const algorithm = await this.findOne(id);
    
    Object.assign(algorithm, updateAlgorithmDto);
    
    return this.algorithmRepository.save(algorithm);
  }

  async setActive(id: string): Promise<Algorithm> {
    const algorithm = await this.findOne(id);
    
    // Deactivate all currently active algorithms
    await this.algorithmRepository.update(
      { status: AlgorithmStatus.ACTIVE },
      { status: AlgorithmStatus.INACTIVE }
    );
    
    // Set the selected one to active
    algorithm.status = AlgorithmStatus.ACTIVE;
    
    return this.algorithmRepository.save(algorithm);
  }

  async updateMetrics(id: string, metrics: Record<string, any>): Promise<Algorithm> {
    const algorithm = await this.findOne(id);
    
    algorithm.metrics = {
      ...algorithm.metrics,
      ...metrics,
      lastUpdated: new Date().toISOString(),
    };
    
    return this.algorithmRepository.save(algorithm);
  }

  async remove(id: string): Promise<void> {
    const algorithm = await this.findOne(id);
    await this.algorithmRepository.remove(algorithm);
  }
}