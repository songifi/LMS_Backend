import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Inject,
  forwardRef,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import type { Repository, FindOptionsWhere } from 'typeorm'
import { Registration } from '../entities/registration.entity'
import type { CreateRegistrationDto } from '../dto/create-registration.dto'
import { EnrollmentPeriodService } from './enrollment-period.service'
import { RegistrationHistory } from '../entities/registration-history.entity'
import { PrerequisiteService } from './prerequisite.service'
import { WaitlistService } from './waitlist.service'
import { RegistrationStatus } from '../enums/registrationStatus.enum'

@Injectable()
export class RegistrationService {
  constructor(
    @InjectRepository(Registration)
    private readonly registrationRepository: Repository<Registration>,
    @InjectRepository(RegistrationHistory)
    private readonly registrationHistoryRepository: Repository<RegistrationHistory>,

    @Inject(forwardRef(() => EnrollmentPeriodService))
    private readonly enrollmentPeriodService: EnrollmentPeriodService,

    private readonly prerequisiteService: PrerequisiteService,
    private readonly waitlistService: WaitlistService,
  ) {}

  async create(createRegistrationDto: CreateRegistrationDto): Promise<Registration> {
    // Verify enrollment period is active
    const enrollmentPeriod = await this.enrollmentPeriodService.findOne(createRegistrationDto.enrollmentPeriodId)
    const now = new Date()

    if (!enrollmentPeriod.isActive || now < enrollmentPeriod.startDate || now > enrollmentPeriod.endDate) {
      throw new BadRequestException("Registration is not allowed during this enrollment period")
    }

    // Check for existing registration
    const existingRegistration = await this.registrationRepository.findOne({
      where: {
        studentId: createRegistrationDto.studentId,
        courseId: createRegistrationDto.courseId,
        semesterId: createRegistrationDto.semesterId,
        status: RegistrationStatus.APPROVED,
      },
    })

    if (existingRegistration) {
      throw new ConflictException("Student is already registered for this course")
    }

    // Check prerequisites
    const prerequisitesVerified = await this.prerequisiteService.verifyPrerequisites(
      createRegistrationDto.studentId,
      createRegistrationDto.courseId,
    )

    // Create registration
    const registration = this.registrationRepository.create({
      ...createRegistrationDto,
      prerequisitesVerified,
      status: prerequisitesVerified ? RegistrationStatus.PENDING : RegistrationStatus.PENDING,
    })

    const savedRegistration = await this.registrationRepository.save(registration)

    // Create registration history entry
    await this.createHistoryEntry(
      savedRegistration.id,
      null,
      RegistrationStatus.PENDING,
      createRegistrationDto.studentId,
      "Initial registration",
    )

    return savedRegistration
  }

  async findAll(filters?: Partial<Registration>): Promise<Registration[]> {
    const where: FindOptionsWhere<Registration> = {}

    if (filters) {
      Object.keys(filters).forEach((key) => {
        where[key] = filters[key]
      })
    }

    return this.registrationRepository.find({
      where,
      relations: ["enrollmentPeriod"],
      order: {
        createdAt: "DESC",
      },
    })
  }

  async findByStudent(studentId: string): Promise<Registration[]> {
    return this.registrationRepository.find({
      where: { studentId },
      relations: ["enrollmentPeriod"],
      order: {
        createdAt: "DESC",
      },
    })
  }

  async findOne(id: string): Promise<Registration> {
    const registration = await this.registrationRepository.findOne({
      where: { id },
      relations: ["enrollmentPeriod", "history", "payments", "approvals"],
    })

    if (!registration) {
      throw new NotFoundException(`Registration with ID ${id} not found`)
    }

    return registration
  }

  async updateStatus(id: string, status: RegistrationStatus, userId: string, reason: string): Promise<Registration> {
    const registration = await this.findOne(id)
    const previousStatus = registration.status

    registration.status = status

    const updatedRegistration = await this.registrationRepository.save(registration)

    // Create history entry
    await this.createHistoryEntry(id, previousStatus, status, userId, reason)

    return updatedRegistration
  }

  async remove(id: string, userId: string, reason: string): Promise<void> {
    const registration = await this.findOne(id)
    const previousStatus = registration.status

    // Update status to dropped
    registration.status = RegistrationStatus.DROPPED
    await this.registrationRepository.save(registration)

    // Create history entry
    await this.createHistoryEntry(id, previousStatus, RegistrationStatus.DROPPED, userId, reason)
  }

  private async createHistoryEntry(
    registrationId: string,
    previousStatus: RegistrationStatus | null,
    newStatus: RegistrationStatus,
    changedBy: string,
    reason: string,
  ): Promise<RegistrationHistory> {
    const historyEntry = this.registrationHistoryRepository.create({
      registrationId,
      previousStatus: previousStatus || newStatus, // If no previous status, use new status
      newStatus,
      changedBy,
      reason,
    })

    return this.registrationHistoryRepository.save(historyEntry)
  }

  async getRegistrationHistory(registrationId: string): Promise<RegistrationHistory[]> {
    return this.registrationHistoryRepository.find({
      where: { registrationId },
      order: {
        createdAt: "DESC",
      },
    })
  }

  async verifyAndUpdatePrerequisites(registrationId: string): Promise<Registration> {
    const registration = await this.findOne(registrationId)

    const prerequisitesVerified = await this.prerequisiteService.verifyPrerequisites(
      registration.studentId,
      registration.courseId,
    )

    registration.prerequisitesVerified = prerequisitesVerified

    return this.registrationRepository.save(registration)
  }
}
