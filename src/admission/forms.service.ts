import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ApplicationForm } from './entities/application-form.entity';
import { FormField } from './entities/form-field.entity';
import { CreateApplicationFormDto, FormFieldDto, UpdateApplicationFormDto } from './dto/form.dto';

@Injectable()
export class FormsService {
    constructor(
        @InjectRepository(ApplicationForm)
        private formsRepository: Repository<ApplicationForm>,
        @InjectRepository(FormField)
        private fieldsRepository: Repository<FormField>,
        private dataSource: DataSource,
    ) {}

    async findAll(): Promise<ApplicationForm[]> {
        return this.formsRepository.find({
            relations: ['fields'],
            order: {
                createdAt: 'DESC',
            },
        });
    }

    async findOne(id: string): Promise<ApplicationForm> {
        const form = await this.formsRepository.findOne({
            where: { id },
            relations: ['fields'],
        });

        if (!form) {
            throw new NotFoundException(`Form with ID ${id} not found`);
        }

        return form;
    }

    async create(createFormDto: CreateApplicationFormDto): Promise<ApplicationForm> {
        // Start transaction
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        
        try {
            // Create form
            const form = this.formsRepository.create({
                name: createFormDto.name,
                description: createFormDto.description,
                programId: createFormDto.programId,
                status: createFormDto.status,
                isDefault: createFormDto.isDefault || false,
        startDate: createFormDto.startDate,
        endDate: createFormDto.endDate,
      });
      
      const savedForm = await queryRunner.manager.save(form);
      
      // Create fields if provided
      if (createFormDto.fields && createFormDto.fields.length > 0) {
        const fields = createFormDto.fields.map((fieldDto, index) => {
          return this.fieldsRepository.create({
            ...fieldDto,
            formId: savedForm.id,
            order: fieldDto.order ?? index,
          });
        });
        
        await queryRunner.manager.save(fields);
      }
      
      // If this is the default form, unset other default forms for this program
      if (form.isDefault) {
        await queryRunner.manager.update(
          ApplicationForm,
          { 
            programId: form.programId, 
            isDefault: true,
            id: Not(form.id) 
          },
          { isDefault: false }
        );
      }
      
      await queryRunner.commitTransaction();
      
      return this.findOne(savedForm.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async update(id: string, updateFormDto: UpdateApplicationFormDto): Promise<ApplicationForm> {
    const form = await this.findOne(id);
    
    // Start transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    
    try {
      // Update form
      Object.assign(form, updateFormDto);
      await queryRunner.manager.save(form);
      
      // If this is the default form, unset other default forms for this program
      if (form.isDefault) {
        await queryRunner.manager.update(
          ApplicationForm,
          { 
            programId: form.programId, 
            isDefault: true,
            id: Not(form.id) 
          },
          { isDefault: false }
        );
      }
      
      await queryRunner.commitTransaction();
      
      return this.findOne(id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async addField(formId: string, fieldDto: FormFieldDto): Promise<FormField> {
    const form = await this.findOne(formId);
    
    // Get current max order
    const maxOrder = form.fields.reduce((max, field) => Math.max(max, field.order), -1);
    
    const field = this.fieldsRepository.create({
      ...fieldDto,
      formId,
      order: fieldDto.order ?? maxOrder + 1,
    });
    
    return this.fieldsRepository.save(field);
  }

  async updateField(formId: string, fieldId: string, fieldDto: Partial<FormFieldDto>): Promise<FormField> {
    const field = await this.fieldsRepository.findOne({
      where: { id: fieldId, formId },
    });
    
    if (!field) {
      throw new NotFoundException(`Field with ID ${fieldId} not found in form ${formId}`);
    }
    
    Object.assign(field, fieldDto);
    return this.fieldsRepository.save(field);
  }

  async removeField(formId: string, fieldId: string): Promise<void> {
    const field = await this.fieldsRepository.findOne({
      where: { id: fieldId, formId },
    });
    
    if (!field) {
      throw new NotFoundException(`Field with ID ${fieldId} not found in form ${formId}`);
    }
    
    await this.fieldsRepository.remove(field);
  }

  async remove(id: string): Promise<void> {
    const form = await this.findOne(id);
    await this.formsRepository.remove(form);
  }
}
function Not(id: string) {
    throw new Error('Function not implemented.');
}

