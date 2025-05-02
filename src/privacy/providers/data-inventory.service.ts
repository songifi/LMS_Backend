import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class DataInventoryService {
  constructor(
    @InjectRepository(DataInventoryEntity)
    private dataInventoryRepository: Repository<DataInventoryEntity>,
  ) {}

  async createDataInventory(dto: CreateDataInventoryDto): Promise<DataInventoryEntity> {
    const dataInventory = this.dataInventoryRepository.create(dto);
    return this.dataInventoryRepository.save(dataInventory);
  }

  async findAll(): Promise<DataInventoryEntity[]> {
    return this.dataInventoryRepository.find();
  }

  async findOne(id: string): Promise<DataInventoryEntity> {
    return this.dataInventoryRepository.findOne({ where: { id } });
  }

  async findByEntityName(entityName: string): Promise<DataInventoryEntity> {
    return this.dataInventoryRepository.findOne({ where: { entityName } });
  }

  async update(id: string, dto: Partial<CreateDataInventoryDto>): Promise<DataInventoryEntity> {
    await this.dataInventoryRepository.update(id, dto);
    return this.dataInventoryRepository.findOne({ where: { id } });
  }

  async remove(id: string): Promise<void> {
    await this.dataInventoryRepository.delete(id);
  }

  async getPersonalDataFields(entityName: string): Promise<DataFieldMetadata[]> {
    const inventory = await this.findByEntityName(entityName);
    return inventory ? inventory.fields.filter(field => field.personalData) : [];
  }

  async getSensitiveDataFields(entityName: string): Promise<DataFieldMetadata[]> {
    const inventory = await this.findByEntityName(entityName);
    return inventory ? inventory.fields.filter(field => field.sensitiveData) : [];
  }

  async getEntitiesWithPersonalData(): Promise<DataInventoryEntity[]> {
    return this.dataInventoryRepository.find({ 
      where: { containsPersonalData: true } 
    });
  }
}