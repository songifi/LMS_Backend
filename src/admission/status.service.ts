import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApplicationStatus, StatusType } from './entities/application-status.entity';
import { UpdateApplicationStatusDto } from './dto/status.dto';
@Injectable()
export class StatusService {
  constructor(
    @InjectRepository(ApplicationStatus)
    private statusRepository: Repository<ApplicationStatus>,
  ) {}

  async findByApplication(applicationId: string): Promise<ApplicationStatus[]> {
    return this.statusRepository.find({
      where: { applicationId },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async getCurrentStatus(applicationId: string): Promise<ApplicationStatus> {
    const statuses = await this.findByApplication(applicationId);
    
    if (!statuses || statuses.length === 0) {
      throw new NotFoundException(`No status found for application ${applicationId}`);
    }
    
    return statuses[0]; // Get the most recent status
  }

  async createInitialStatus(applicationId: string): Promise<ApplicationStatus> {
    const status = this.statusRepository.create({
      applicationId,
      status: StatusType.DRAFT,
      notes: 'Application created',
    });
    
    return this.statusRepository.save(status);
  }

  async updateStatus(applicationId: string, updateStatusDto: UpdateApplicationStatusDto): Promise<ApplicationStatus> {
    const status = this.statusRepository.create({
      applicationId,
      ...updateStatusDto,
    });
    
    return this.statusRepository.save(status);
  }
}