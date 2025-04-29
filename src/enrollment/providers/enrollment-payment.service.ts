import { Injectable, NotFoundException, BadRequestException, Inject, forwardRef } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import type { Repository } from "typeorm"
import { EnrollmentPayment, PaymentStatus } from "../entities/enrollment-payment.entity"
import type { CreateEnrollmentPaymentDto } from "../dto/create-enrollment-payment.dto"
import { RegistrationService } from "./registration.service"
import { RegistrationStatus } from "../enums/registrationStatus.enum"

@Injectable()
export class EnrollmentPaymentService {
  constructor(
    @InjectRepository(EnrollmentPayment)
    private enrollmentPaymentRepository: Repository<EnrollmentPayment>,
  
    @Inject(forwardRef(() => RegistrationService))
    private registrationService: RegistrationService,
  ) {}
  

  async create(createEnrollmentPaymentDto: CreateEnrollmentPaymentDto): Promise<EnrollmentPayment> {
    // Verify registration exists
    await this.registrationService.findOne(createEnrollmentPaymentDto.registrationId);

    const payment = this.enrollmentPaymentRepository.create({
      ...createEnrollmentPaymentDto,
      status: PaymentStatus.PENDING,
    });

    return this.enrollmentPaymentRepository.save(payment);
  }

  async findByRegistration(registrationId: string): Promise<EnrollmentPayment[]> {
    return this.enrollmentPaymentRepository.find({
      where: { registrationId },
      order: {
        createdAt: "DESC",
      },
    })
  }

  async findOne(id: string): Promise<EnrollmentPayment> {
    const payment = await this.enrollmentPaymentRepository.findOne({
      where: { id },
      relations: ["registration"],
    })

    if (!payment) {
      throw new NotFoundException(`Enrollment payment with ID ${id} not found`)
    }

    return payment
  }

  async processPayment(id: string, transactionId: string): Promise<EnrollmentPayment> {
    const payment = await this.findOne(id)

    if (payment.status !== PaymentStatus.PENDING) {
      throw new BadRequestException("This payment has already been processed")
    }

    payment.status = PaymentStatus.COMPLETED
    payment.transactionId = transactionId
    payment.paymentDate = new Date()

    const savedPayment = await this.enrollmentPaymentRepository.save(payment)

    // Update registration status if needed
    const registration = await this.registrationService.findOne(payment.registrationId)
    if (registration.status === RegistrationStatus.PENDING && registration.prerequisitesVerified) {
      await this.registrationService.updateStatus(
        registration.id,
        RegistrationStatus.APPROVED,
        "system",
        "Payment completed",
      )
    }

    return savedPayment
  }

  async failPayment(id: string, reason: string): Promise<EnrollmentPayment> {
    const payment = await this.findOne(id)

    if (payment.status !== PaymentStatus.PENDING) {
      throw new BadRequestException("This payment has already been processed")
    }

    payment.status = PaymentStatus.FAILED
    payment.notes = reason

    return this.enrollmentPaymentRepository.save(payment)
  }

  async refundPayment(id: string, reason: string): Promise<EnrollmentPayment> {
    const payment = await this.findOne(id)

    if (payment.status !== PaymentStatus.COMPLETED) {
      throw new BadRequestException("Only completed payments can be refunded")
    }

    payment.status = PaymentStatus.REFUNDED
    payment.notes = reason

    return this.enrollmentPaymentRepository.save(payment)
  }
}
