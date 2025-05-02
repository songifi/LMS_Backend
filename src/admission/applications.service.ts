import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Application, ApplicationDecision } from './entities/application.entity';
import { ApplicationStatus, StatusType } from './entities/application-status.entity';
import { ApplicationDocument } from './entities/application-document.entity';
import { ApplicationReview } from './entities/application-review.entity';
import { ApplicationFee } from './entities/application-fee.entity';
import { ApplicationCommunication } from './entities/application-communication.entity';

@Injectable()
export class ApplicationService {
  constructor(
    @InjectRepository(Application)
    private applicationRepository: Repository<Application>,
    @InjectRepository(ApplicationStatus)
    private statusRepository: Repository<ApplicationStatus>,
    @InjectRepository(ApplicationDocument)
    private documentRepository: Repository<ApplicationDocument>,
    @InjectRepository(ApplicationReview)
    private reviewRepository: Repository<ApplicationReview>,
    @InjectRepository(ApplicationFee)
    private feeRepository: Repository<ApplicationFee>,
    @InjectRepository(ApplicationCommunication)
    private communicationRepository: Repository<ApplicationCommunication>,
  ) {}

  async findAll(options: {
    programId?: string;
    status?: StatusType;
    decision?: ApplicationDecision;
    page: number;
    limit: number;
  }) {
    const { programId, status, decision, page, limit } = options;
    const skip = (page - 1) * limit;

    // Build the query
    const query: FindOptionsWhere<Application> = {};
    
    if (programId) {
      query.programId = programId;
    }
    
    if (decision) {
      query.decision = decision;
    }

    // First query applications
    const [applications, total] = await this.applicationRepository.findAndCount({
      where: query,
      skip,
      take: limit,
      relations: ['form', 'statusHistory'],
      order: { updatedAt: 'DESC' },
    });

    // If status filter is applied, post-filter results
    let filteredApplications = applications;
    if (status) {
      filteredApplications = applications.filter(app => {
        if (!app.statusHistory || app.statusHistory.length === 0) {
          return false;
        }
        // Get latest status
        const latestStatus = app.statusHistory.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )[0];
        return latestStatus.status === status;
      });
    }

    return {
      data: filteredApplications,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<Application> {
    const application = await this.applicationRepository.findOne({
      where: { id },
      relations: ['form', 'documents', 'reviews', 'statusHistory', 'fees', 'communications'],
    });

    if (!application) {
      throw new NotFoundException(`Application with ID ${id} not found`);
    }

    return application;
  }

  async findByPublicToken(token: string): Promise<Application> {
    const application = await this.applicationRepository.findOne({
      where: { publicAccessToken: token },
      relations: ['form', 'documents'],
    });

    if (!application) {
      throw new NotFoundException(`Application not found`);
    }

    return application;
  }

  async create(applicationData: Partial<Application>): Promise<Application> {
    const newApplication = this.applicationRepository.create({
      ...applicationData,
      formData: applicationData.formData || {},
      isCompleted: false,
      isSubmitted: false,
    });

    const savedApplication = await this.applicationRepository.save(newApplication);

    // Create initial status
    const initialStatus = this.statusRepository.create({
      applicationId: savedApplication.id,
      status: StatusType.DRAFT,
      notes: 'Application created',
    });

    await this.statusRepository.save(initialStatus);

    return this.findOne(savedApplication.id);
  }

  async update(id: string, applicationData: Partial<Application>): Promise<Application> {
    const application = await this.findOne(id);

    if (application.isSubmitted) {
      throw new BadRequestException('Cannot update a submitted application');
    }

    // Update application fields
    const updatableFields = ['formData', 'isCompleted'];
    updatableFields.forEach(field => {
      if (applicationData[field] !== undefined) {
        application[field] = applicationData[field];
      }
    });

    await this.applicationRepository.save(application);
    return this.findOne(id);
  }

  async submit(id: string): Promise<Application> {
    const application = await this.findOne(id);

    if (application.isSubmitted) {
      throw new BadRequestException('Application is already submitted');
    }

    if (!application.isCompleted) {
      throw new BadRequestException('Cannot submit an incomplete application');
    }

    // Update application
    application.isSubmitted = true;
    application.submittedAt = new Date();
    await this.applicationRepository.save(application);

    // Create status entry
    const status = this.statusRepository.create({
      applicationId: id,
      status: StatusType.SUBMITTED,
      notes: 'Application submitted',
    });
    await this.statusRepository.save(status);

    return this.findOne(id);
  }

  async makeDecision(
    id: string,
    decision: ApplicationDecision,
    decisionBy: string,
    notes?: string,
  ): Promise<Application> {
    const application = await this.findOne(id);

    if (!application.isSubmitted) {
      throw new BadRequestException('Cannot make a decision on an unsubmitted application');
    }

    // Update application
    application.decision = decision;
    application.decisionBy = decisionBy;
    application.decisionDate = new Date();
    application.decisionNotes = notes || '';
    await this.applicationRepository.save(application);

    // Create status entry
    let statusType: StatusType;
    switch (decision) {
      case ApplicationDecision.ACCEPTED:
        statusType = StatusType.ACCEPTED;
        break;
      case ApplicationDecision.REJECTED:
        statusType = StatusType.REJECTED;
        break;
      case ApplicationDecision.WAITLISTED:
        statusType = StatusType.WAITLISTED;
        break;
      case ApplicationDecision.DEFERRED:
        statusType = StatusType.DEFERRED;
        break;
      default:
        statusType = StatusType.DECISION_MADE;
    }

    const status = this.statusRepository.create({
      applicationId: id,
      status: statusType,
      notes: `Decision: ${decision}${notes ? ` - ${notes}` : ''}`,
      changedBy: decisionBy,
    });
    await this.statusRepository.save(status);

    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const application = await this.findOne(id);
    await this.applicationRepository.remove(application);
  }

  async getDocuments(id: string): Promise<ApplicationDocument[]> {
    return this.documentRepository.find({
      where: { applicationId: id },
      order: { uploadedAt: 'DESC' },
    });
  }

  async getReviews(id: string): Promise<ApplicationReview[]> {
    return this.reviewRepository.find({
      where: { applicationId: id },
      order: { createdAt: 'DESC' },
    });
  }

  async getStatusHistory(id: string): Promise<ApplicationStatus[]> {
    return this.statusRepository.find({
      where: { applicationId: id },
      order: { createdAt: 'DESC' },
    });
  }

  async getFees(id: string): Promise<ApplicationFee[]> {
    return this.feeRepository.find({
      where: { applicationId: id },
      order: { createdAt: 'DESC' },
    });
  }

  async getCommunications(id: string): Promise<ApplicationCommunication[]> {
    return this.communicationRepository.find({
      where: { applicationId: id },
      order: { createdAt: 'DESC' },
    });
  }

  async generatePublicToken(id: string): Promise<{ token: string }> {
    const application = await this.findOne(id);
    
    // Generate a unique token
    const token = uuidv4();
    
    // Save token to application
    application.publicAccessToken = token;
    await this.applicationRepository.save(application);
    
    return { token };
  }

  async updateStatus(id: string, status: StatusType, changedBy?: string, notes?: string): Promise<ApplicationStatus> {
    // Check if application exists
    await this.findOne(id);
    
    // Create new status entry
    const statusEntry = this.statusRepository.create({
      applicationId: id,
      status,
      notes,
      changedBy,
    });
    
    return this.statusRepository.save(statusEntry);
  }
}