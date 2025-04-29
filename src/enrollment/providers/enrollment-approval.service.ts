import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import type { Repository } from 'typeorm'
import {
  EnrollmentApproval,
  ApprovalStatus,
  ApprovalType,
} from '../entities/enrollment-approval.entity'
import type { CreateEnrollmentApprovalDto } from '../dto/create-enrollment-approval.dto'
import { RegistrationService } from './registration.service'
import { RegistrationStatus } from '../enums/registrationStatus.enum'

@Injectable()
export class EnrollmentApprovalService {
  constructor(
    @InjectRepository(EnrollmentApproval)
    private readonly enrollmentApprovalRepository: Repository<EnrollmentApproval>,
    @Inject(forwardRef(() => RegistrationService))
    private readonly registrationService: RegistrationService,
  ) {}

  async create(createEnrollmentApprovalDto: CreateEnrollmentApprovalDto): Promise<EnrollmentApproval> {
    await this.registrationService.findOne(createEnrollmentApprovalDto.registrationId)

    const existingApproval = await this.enrollmentApprovalRepository.findOne({
      where: {
        registrationId: createEnrollmentApprovalDto.registrationId,
        approvalType: createEnrollmentApprovalDto.approvalType,
        status: ApprovalStatus.PENDING,
      },
    })

    if (existingApproval) {
      throw new BadRequestException('An approval request of this type is already pending')
    }

    const approval = this.enrollmentApprovalRepository.create({
      ...createEnrollmentApprovalDto,
      status: ApprovalStatus.PENDING,
      requestDate: new Date(),
    })

    return this.enrollmentApprovalRepository.save(approval)
  }

  async findAll(): Promise<EnrollmentApproval[]> {
    return this.enrollmentApprovalRepository.find({
      relations: ['registration'],
      order: {
        requestDate: 'DESC',
      },
    })
  }

  async findPending(): Promise<EnrollmentApproval[]> {
    return this.enrollmentApprovalRepository.find({
      where: {
        status: ApprovalStatus.PENDING,
      },
      relations: ['registration'],
      order: {
        requestDate: 'ASC',
      },
    })
  }

  async findByRegistration(registrationId: string): Promise<EnrollmentApproval[]> {
    return this.enrollmentApprovalRepository.find({
      where: {
        registrationId,
      },
      order: {
        requestDate: 'DESC',
      },
    })
  }

  async findOne(id: string): Promise<EnrollmentApproval> {
    const approval = await this.enrollmentApprovalRepository.findOne({
      where: { id },
      relations: ['registration'],
    })

    if (!approval) {
      throw new NotFoundException(`Enrollment approval with ID ${id} not found`)
    }

    return approval
  }

  async approve(id: string, processedBy: string, comments: string): Promise<EnrollmentApproval> {
    const approval = await this.findOne(id)

    if (approval.status !== ApprovalStatus.PENDING) {
      throw new BadRequestException('This approval request has already been processed')
    }

    approval.status = ApprovalStatus.APPROVED
    approval.processedBy = processedBy
    approval.approverComments = comments
    approval.processDate = new Date()

    const savedApproval = await this.enrollmentApprovalRepository.save(approval)

    if (approval.approvalType === ApprovalType.PREREQUISITE_OVERRIDE) {
      const registration = await this.registrationService.findOne(approval.registrationId)
      registration.prerequisitesVerified = true
      await this.registrationService.updateStatus(
        registration.id,
        RegistrationStatus.APPROVED,
        processedBy,
        'Prerequisites override approved',
      )
    }

    return savedApproval
  }

  async reject(id: string, processedBy: string, comments: string): Promise<EnrollmentApproval> {
    const approval = await this.findOne(id)

    if (approval.status !== ApprovalStatus.PENDING) {
      throw new BadRequestException('This approval request has already been processed')
    }

    approval.status = ApprovalStatus.REJECTED
    approval.processedBy = processedBy
    approval.approverComments = comments
    approval.processDate = new Date()

    return this.enrollmentApprovalRepository.save(approval)
  }
}
