import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApplicationForm, FormStatus } from './entities/application-form.entity';
import { FormField } from './entities/form-field.entity';
import { DocumentRequirement } from './entities/document-requirement.entity';

@Injectable()
export class ApplicationFormService {
  constructor(
    @InjectRepository(ApplicationForm)
    private formRepository: Repository<ApplicationForm>,
    @InjectRepository(FormField)
    private fieldRepository: Repository<FormField>,
    @InjectRepository(DocumentRequirement)
    private documentRequirementRepository: Repository<DocumentRequirement>,
  ) {}

  async findAll(options: {
    programId?: string;
    status?: FormStatus;
    isDefault?: boolean;
  }): Promise<ApplicationForm[]> {
    const { programId, status, isDefault } = options;
    
    const queryOptions: any = { 
      relations: ['fields'],
      order: { updatedAt: 'DESC' },
    };
    
    if (programId || status !== undefined || isDefault !== undefined) {
      queryOptions.where = {};
      
      if (programId) {
        queryOptions.where.programId = programId;
      }
      
      if (status) {
        queryOptions.where.status = status;
      }
      
      if (isDefault !== undefined) {
        queryOptions.where.isDefault = isDefault;
      }
    }
    
    return this.formRepository.find(queryOptions);
  }

  async findOne(id: string): Promise<ApplicationForm> {
    const form = await this.formRepository.findOne({
      where: { id },
      relations: ['fields'],
    });
    
    if (!form) {
      throw new NotFoundException(`Application form with ID ${id} not found`);
    }
    
    return form;
  }

  async create(formData: Partial<ApplicationForm> & {
    fields?: Partial<FormField>[];
    documentRequirements?: Partial<DocumentRequirement>[];
  }): Promise<ApplicationForm> {
    // Extract fields and document requirements for later use
    const { fields, documentRequirements, ...formDetails } = formData;
    
    // Create and save the form
    const newForm = this.formRepository.create({
      ...formDetails,
      status: formDetails.status || FormStatus.DRAFT,
      isDefault: formDetails.isDefault || false,
    });
    
    const savedForm = await this.formRepository.save(newForm);
    
    // Add fields if provided
    if (fields && fields.length > 0) {
      for (const fieldData of fields) {
        await this.addField(savedForm.id, fieldData);
      }
    }
    
    // Add document requirements if provided
    if (documentRequirements && documentRequirements.length > 0) {
      for (const reqData of documentRequirements) {
        await this.addDocumentRequirement(savedForm.id, reqData);
      }
    }
    
    // Return the complete form with relations
    return this.findOne(savedForm.id);
  }

  async update(id: string, formData: Partial<ApplicationForm>): Promise<ApplicationForm> {
    const form = await this.findOne(id);
    
    // Update form fields
    Object.assign(form, formData);
    
    await this.formRepository.save(form);
    
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const form = await this.findOne(id);
    
    // First remove all related fields
    if (form.fields && form.fields.length > 0) {
      await this.fieldRepository.remove(form.fields);
    }
    
    // Then remove all related document requirements
    const requirements = await this.documentRequirementRepository.find({
      where: { formId: id },
    });
    
    if (requirements.length > 0) {
      await this.documentRequirementRepository.remove(requirements);
    }
    
    // Finally remove the form
    await this.formRepository.remove(form);
  }

  async unsetDefaultsForProgram(programId: string): Promise<void> {
    const defaultForms = await this.formRepository.find({
      where: { programId, isDefault: true },
    });
    
    if (defaultForms.length > 0) {
      for (const form of defaultForms) {
        form.isDefault = false;
        await this.formRepository.save(form);
      }
    }
  }

  // Field operations
  async getFields(formId: string): Promise<FormField[]> {
    return this.fieldRepository.find({
      where: { formId },
      order: { order: 'ASC' },
    });
  }

  async addField(formId: string, fieldData: Partial<FormField>): Promise<FormField> {
    // Check if form exists
    await this.findOne(formId);
    
    // Determine the next order
    const existingFields = await this.fieldRepository.find({
      where: { formId },
      order: { order: 'DESC' },
      take: 1,
    });
    
    const nextOrder = existingFields.length > 0 ? existingFields[0].order + 1 : 0;
    
    // Create and save the field
    const newField = this.fieldRepository.create({
      ...fieldData,
      formId,
      order: fieldData.order !== undefined ? fieldData.order : nextOrder,
      isActive: fieldData.isActive !== undefined ? fieldData.isActive : true,
    });
    
    return this.fieldRepository.save(newField);
  }

  async updateField(formId: string, fieldId: string, fieldData: Partial<FormField>): Promise<FormField> {
    // Check if form exists
    await this.findOne(formId);
    
    // Find the field
    const field = await this.fieldRepository.findOne({
      where: { id: fieldId, formId },
    });
    
    if (!field) {
      throw new NotFoundException(`Field with ID ${fieldId} not found in form ${formId}`);
    }
    
    // Update field properties
    Object.assign(field, fieldData);
    
    return this.fieldRepository.save(field);
  }

  async removeField(formId: string, fieldId: string): Promise<void> {
    // Check if form exists
    await this.findOne(formId);
    
    // Find the field
    const field = await this.fieldRepository.findOne({
      where: { id: fieldId, formId },
    });
    
    if (!field) {
      throw new NotFoundException(`Field with ID ${fieldId} not found in form ${formId}`);
    }
    
    await this.fieldRepository.remove(field);
  }

  // Document requirement operations
  async getDocumentRequirements(formId: string): Promise<DocumentRequirement[]> {
    return this.documentRequirementRepository.find({
      where: { formId },
    });
  }

  async addDocumentRequirement(formId: string, requirementData: Partial<DocumentRequirement>): Promise<DocumentRequirement> {
    // Check if form exists
    await this.findOne(formId);
    
    // Create and save the document requirement
    const newRequirement = this.documentRequirementRepository.create({
      ...requirementData,
      formId,
      isActive: requirementData.isActive !== undefined ? requirementData.isActive : true,
      isRequired: requirementData.isRequired !== undefined ? requirementData.isRequired : true,
      maxFileSizeMB: requirementData.maxFileSizeMB || 10,
      maxFiles: requirementData.maxFiles || 1,
    });
    
    return this.documentRequirementRepository.save(newRequirement);
  }

  async updateDocumentRequirement(
    formId: string,
    reqId: string,
    requirementData: Partial<DocumentRequirement>,
  ): Promise<DocumentRequirement> {
    // Check if form exists
    await this.findOne(formId);
    
    // Find the document requirement
    const requirement = await this.documentRequirementRepository.findOne({
      where: { id: reqId, formId },
    });
    
    if (!requirement) {
      throw new NotFoundException(`Document requirement with ID ${reqId} not found in form ${formId}`);
    }
    
    // Update requirement properties
    Object.assign(requirement, requirementData);
    
    return this.documentRequirementRepository.save(requirement);
  }

  async removeDocumentRequirement(formId: string, reqId: string): Promise<void> {
    // Check if form exists
    await this.findOne(formId);
    
    // Find the document requirement
    const requirement = await this.documentRequirementRepository.findOne({
      where: { id: reqId, formId },
    });
    
    if (!requirement) {
      throw new NotFoundException(`Document requirement with ID ${reqId} not found in form ${formId}`);
    }
    
    await this.documentRequirementRepository.remove(requirement);
  }
}