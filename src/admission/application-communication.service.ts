import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApplicationCommunication, CommunicationStatus, CommunicationType } from './entities/application-communication.entity';
import { CreateCommunicationDto } from './dto/create-communication.dto';
import { UpdateCommunicationDto } from './dto/update-communication.dto';
@Injectable()
export class ApplicationCommunicationService {
  constructor(
    @InjectRepository(ApplicationCommunication)
    private communicationRepository: Repository<ApplicationCommunication>,
  ) {}

  async create(createDto: CreateCommunicationDto): Promise<ApplicationCommunication> {
    const communication = this.communicationRepository.create(createDto);
    return this.communicationRepository.save(communication);
  }

  async findAll(): Promise<ApplicationCommunication[]> {
    return this.communicationRepository.find();
  }

  async findByApplication(applicationId: string): Promise<ApplicationCommunication[]> {
    return this.communicationRepository.find({ where: { applicationId } });
  }

  async findOne(id: string): Promise<ApplicationCommunication> {
    const communication = await this.communicationRepository.findOne({ where: { id } });
    if (!communication) {
      throw new NotFoundException(`Communication with ID ${id} not found`);
    }
    return communication;
  }

  async update(id: string, updateDto: UpdateCommunicationDto): Promise<ApplicationCommunication> {
    const communication = await this.findOne(id);
    
    const updatedCommunication = this.communicationRepository.merge(
      communication,
      updateDto
    );
    
    return this.communicationRepository.save(updatedCommunication);
  }

  async remove(id: string): Promise<void> {
    const result = await this.communicationRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Communication with ID ${id} not found`);
    }
  }

  async updateStatus(
    id: string, 
    status: CommunicationStatus, 
    errorMessage?: string
  ): Promise<ApplicationCommunication> {
    const communication = await this.findOne(id);
    
    communication.status = status;
    
    // Update timestamp based on status
    if (status === CommunicationStatus.SENT) {
      communication.sentAt = new Date();
    } else if (status === CommunicationStatus.DELIVERED) {
      communication.deliveredAt = new Date();
    } else if (status === CommunicationStatus.READ) {
      communication.readAt = new Date();
    }
    
    // Set error message if provided
    if (errorMessage) {
      communication.errorMessage = errorMessage;
    }
    
    return this.communicationRepository.save(communication);
  }

  async findByType(type: CommunicationType): Promise<ApplicationCommunication[]> {
    return this.communicationRepository.find({ where: { type } });
  }

  async findByStatus(status: CommunicationStatus): Promise<ApplicationCommunication[]> {
    return this.communicationRepository.find({ where: { status } });
  }

  async findPendingCommunications(): Promise<ApplicationCommunication[]> {
    return this.communicationRepository.find({ 
      where: { status: CommunicationStatus.PENDING } 
    });
  }
  
  async markAsSent(id: string): Promise<ApplicationCommunication> {
    return this.updateStatus(id, CommunicationStatus.SENT);
  }
  
  async markAsDelivered(id: string): Promise<ApplicationCommunication> {
    return this.updateStatus(id, CommunicationStatus.DELIVERED);
  }
  
  async markAsRead(id: string): Promise<ApplicationCommunication> {
    return this.updateStatus(id, CommunicationStatus.READ);
  }
  
  async markAsFailed(id: string, errorMessage: string): Promise<ApplicationCommunication> {
    return this.updateStatus(id, CommunicationStatus.FAILED, errorMessage);
  }
}