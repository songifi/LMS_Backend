import { NotFoundException, BadRequestException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { type Repository, LessThanOrEqual, MoreThanOrEqual, Between } from "typeorm"
import { EnrollmentPeriod } from "../entities/enrollment-period.entity"
import type { CreateEnrollmentPeriodDto } from "../dto/create-enrollment-period.dto"

export class EnrollmentPeriodService {
  constructor(
    @InjectRepository(EnrollmentPeriod)
    private enrollmentPeriodRepository: Repository<EnrollmentPeriod>,
  ) {}

  async create(createEnrollmentPeriodDto: CreateEnrollmentPeriodDto): Promise<EnrollmentPeriod> {
    const startDate = new Date(createEnrollmentPeriodDto.startDate)
    const endDate = new Date(createEnrollmentPeriodDto.endDate)

    if (startDate >= endDate) {
      throw new BadRequestException("Start date must be before end date")
    }

    const enrollmentPeriod = this.enrollmentPeriodRepository.create({
      ...createEnrollmentPeriodDto,
      startDate,
      endDate,
    })

    return this.enrollmentPeriodRepository.save(enrollmentPeriod)
  }

  async findAll(): Promise<EnrollmentPeriod[]> {
    return this.enrollmentPeriodRepository.find({
      order: {
        startDate: "DESC",
      },
    })
  }

  async findActive(): Promise<EnrollmentPeriod[]> {
    const now = new Date()
    return this.enrollmentPeriodRepository.find({
      where: {
        isActive: true,
        startDate: LessThanOrEqual(now),
        endDate: MoreThanOrEqual(now),
      },
      order: {
        priorityLevel: "ASC",
        startDate: "DESC",
      },
    })
  }

  async findOne(id: string): Promise<EnrollmentPeriod> {
    const enrollmentPeriod = await this.enrollmentPeriodRepository.findOne({
      where: { id },
    })

    if (!enrollmentPeriod) {
      throw new NotFoundException(`Enrollment period with ID ${id} not found`)
    }

    return enrollmentPeriod
  }

  async update(id: string, updateEnrollmentPeriodDto: Partial<CreateEnrollmentPeriodDto>): Promise<EnrollmentPeriod> {
    const enrollmentPeriod = await this.findOne(id)

    // Handle date conversions if they exist in the DTO
    let startDate = enrollmentPeriod.startDate
    let endDate = enrollmentPeriod.endDate

    if (updateEnrollmentPeriodDto.startDate) {
      startDate = new Date(updateEnrollmentPeriodDto.startDate)
    }

    if (updateEnrollmentPeriodDto.endDate) {
      endDate = new Date(updateEnrollmentPeriodDto.endDate)
    }

    if (startDate >= endDate) {
      throw new BadRequestException("Start date must be before end date")
    }

    Object.assign(enrollmentPeriod, {
      ...updateEnrollmentPeriodDto,
      startDate,
      endDate,
    })

    return this.enrollmentPeriodRepository.save(enrollmentPeriod)
  }

  async remove(id: string): Promise<void> {
    const enrollmentPeriod = await this.findOne(id)
    await this.enrollmentPeriodRepository.remove(enrollmentPeriod)
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<EnrollmentPeriod[]> {
    return this.enrollmentPeriodRepository.find({
      where: [
        { startDate: Between(startDate, endDate) },
        { endDate: Between(startDate, endDate) },
        {
          startDate: LessThanOrEqual(startDate),
          endDate: MoreThanOrEqual(endDate),
        },
      ],
      order: {
        startDate: "ASC",
      },
    })
  }

  async findByAcademicTerm(academicTerm: string, academicYear: string): Promise<EnrollmentPeriod[]> {
    return this.enrollmentPeriodRepository.find({
      where: {
        academicTerm,
        academicYear,
      },
      order: {
        startDate: "ASC",
      },
    })
  }

  async activateEnrollmentPeriod(id: string): Promise<EnrollmentPeriod> {
    const enrollmentPeriod = await this.findOne(id)
    enrollmentPeriod.isActive = true
    return this.enrollmentPeriodRepository.save(enrollmentPeriod)
  }

  async deactivateEnrollmentPeriod(id: string): Promise<EnrollmentPeriod> {
    const enrollmentPeriod = await this.findOne(id)
    enrollmentPeriod.isActive = false
    return this.enrollmentPeriodRepository.save(enrollmentPeriod)
  }
}
