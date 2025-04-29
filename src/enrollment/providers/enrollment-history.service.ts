import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import type { Repository } from "typeorm"
import { RegistrationHistory } from "../entities/registration-history.entity"

@Injectable()
export class EnrollmentHistoryService {
  constructor(
    @InjectRepository(RegistrationHistory)
    private readonly registrationHistoryRepository: Repository<RegistrationHistory>,
  ) {}

  async findByStudent(studentId: string): Promise<RegistrationHistory[]> {
    return this.registrationHistoryRepository
      .createQueryBuilder("history")
      .innerJoin("history.registration", "registration", "registration.studentId = :studentId", { studentId })
      .orderBy("history.createdAt", "DESC")
      .getMany()
  }

  async findByRegistration(registrationId: string): Promise<RegistrationHistory[]> {
    return this.registrationHistoryRepository.find({
      where: { registrationId },
      order: {
        createdAt: "DESC",
      },
    })
  }
}
