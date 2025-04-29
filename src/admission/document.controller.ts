import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { ApplicationDocument } from './entities/application-document.entity';
import { DocumentRequirement } from './entities/document-requirement.entity';
import { ApplicationService } from './applications.service';
import { StatusType } from './entities/application-status.entity';

@Injectable()
export class DocumentService {
  constructor(
    @InjectRepository(ApplicationDocument)
    private documentRepository: Repository<ApplicationDocument>,
    @InjectRepository(DocumentRequirement)
    private requirementRepository: Repository<DocumentRequirement>,
    private readonly applicationService: ApplicationService,
  ) {}

  async findOne(id: string): Promise<ApplicationDocument> {
    const document = await this.documentRepository.findOne({
      where: { id },
      relations: ['requirement'],
    });
    
    if (!document) {
      throw new NotFoundException(`Document with ID ${id} not found`);
    }
    
    return document;
  }

  async uploadDocument(data: {
    applicationId: string;
    requirementId: string;
    file: {
      originalFilename: string;
      filename: string;
      mimeType: string;
      size: number;
      path: string;
    };
  }): Promise<ApplicationDocument> {
    const { applicationId, requirementId, file } = data;
    
    // Check if application exists
    const application = await this.applicationService.findOne(applicationId);
    
    if (application.isSubmitted) {
      throw new BadRequestException('Cannot upload documents for a submitted application');
    }
    
    // Check if requirement exists
    const requirement = await this.requirementRepository.findOne({
      where: { id: requirementId },
    });
    
    if (!requirement) {
      throw new NotFoundException(`Document requirement with ID ${requirementId} not found`);
    }
    
    // Validate file type if requirements specify allowed types
    if (requirement.allowedFileTypes && requirement.allowedFileTypes.length > 0) {
      const fileExtension = path.extname(file.originalFilename).toLowerCase().substring(1);
      if (!requirement.allowedFileTypes.includes(fileExtension)) {
        throw new BadRequestException(`File type not allowed. Allowed types: ${requirement.allowedFileTypes.join(', ')}`);
      }
    }
    
    // Validate file size
    const maxSizeBytes = requirement.maxFileSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      throw new BadRequestException(`File size exceeds the maximum allowed size of ${requirement.maxFileSizeMB}MB`);
    }
    
    // Check how many documents already exist for this requirement
    const existingDocuments = await this.documentRepository.find({
      where: { applicationId, requirementId },
    });
    
    if (existingDocuments.length >= requirement.maxFiles) {
      throw new BadRequestException(`Maximum number of files (${requirement.maxFiles}) already uploaded for this requirement`);
    }
    
    // Create the document entry
    const newDocument = this.documentRepository.create({
      applicationId,
      requirementId,
      filename: file.filename,
      originalFilename: file.originalFilename,
      mimeType: file.mimeType,
      fileSize: file.size,
      storagePath: file.path,
      isVerified: false,
    });
    
    const savedDocument = await this.documentRepository.save(newDocument);
    
    // Update application status if needed
    const allRequirements = await this.requirementRepository.find({
      where: { formId: application.formId },
    });
    
    const requiredRequirements = allRequirements.filter(req => req.isRequired);
    const uploadedRequirementIds = new Set(
      (await this.documentRepository.find({ where: { applicationId } }))
        .map(doc => doc.requirementId)
    );
    
    const allRequiredUploaded = requiredRequirements.every(req => uploadedRequirementIds.has(req.id));
    
    if (allRequiredUploaded) {
      // Update application to mark it as complete if it's not already
      if (!application.isCompleted) {
        await this.applicationService.update(applicationId, { isCompleted: true });
      }
    }
    
    return savedDocument;
  }

  async verifyDocument(id: string, verifiedBy: string): Promise<ApplicationDocument> {
    const document = await this.findOne(id);
    
    document.isVerified = true;
    document.verifiedBy = verifiedBy;
    document.verifiedAt = new Date();
    document.isRejected = false;
    document.rejectionReason = null;
    
    return this.documentRepository.save(document);
  }

  async rejectDocument(id: string, rejectionReason: string): Promise<ApplicationDocument> {
    const document = await this.findOne(id);
    
    document.isRejected = true;
    document.rejectionReason = rejectionReason;
    document.isVerified = false;
    document.verifiedBy = null;
    document.verifiedAt = null;
    
    // Also update application status
    await this.applicationService.updateStatus(
      document.applicationId,
      StatusType.DOCUMENTS_REQUIRED,
      `Document ${document.originalFilename} rejected: ${rejectionReason}`,
      `Document rejected: ${rejectionReason}`,
    );
    
    return this.documentRepository.save(document);
  }

  async remove(id: string): Promise<void> {
    const document = await this.findOne(id);
    
    // Delete the physical file
    try {
      fs.unlinkSync(document.storagePath);
    } catch (error) {
      console.error(`Error deleting file: ${error.message}`);
      // Continue even if file deletion fails
    }
    
    await this.documentRepository.remove(document);
  }

  async getDownloadUrl(id: string): Promise<{ url: string }> {
    const document = await this.findOne(id);
    
    // In a real application, this might involve generating signed URLs for cloud storage
    // For this example, we'll return a dummy URL
    return { url: `/api/files/download/${document.filename}` };
  }

  async findByApplication(applicationId: string): Promise<ApplicationDocument[]> {
    return this.documentRepository.find({
      where: { applicationId },
      relations: ['requirement'],
      order: { uploadedAt: 'DESC' },
    });
  }
}