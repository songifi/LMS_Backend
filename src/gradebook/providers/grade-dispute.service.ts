import { Injectable, NotFoundException, ForbiddenException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import type { Repository } from "typeorm"
import { GradeDispute } from "../entities/grade-dispute.entity"
import { GradebookEntry } from "../entities/gradebook-entry.entity"
import { User } from "src/user/entities/user.entity"
import { CreateGradeDisputeDto } from "../dto/create-grade-dispute.dto"
import { UpdateGradeDisputeDto } from "../dto/update-grade-dispute.dto"
import { In } from "typeorm";

@Injectable()
export class GradeDisputeService {
  constructor(
    @InjectRepository(GradeDispute)
    private readonly gradeDisputeRepository: Repository<GradeDispute>,
    @InjectRepository(GradebookEntry)
    private readonly gradebookEntryRepository: Repository<GradebookEntry>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {}

  async create(createGradeDisputeDto: CreateGradeDisputeDto, student: User): Promise<GradeDispute> {
    const entry = await this.gradebookEntryRepository.findOne({
      where: { id: createGradeDisputeDto.gradebookEntryId },
      relations: ["student"],
    })

    if (!entry) {
      throw new NotFoundException(`Gradebook entry with ID ${createGradeDisputeDto.gradebookEntryId} not found`)
    }

    // Verify the student is disputing their own grade
    if (entry.student.id !== student.id) {
      throw new ForbiddenException("You can only dispute your own grades")
    }

    // Check if there's already an active dispute
    const existingDispute = await this.gradeDisputeRepository.findOne({
        where: {
          gradebookEntry: { id: entry.id },
          status: In(["pending", "under_review"]),
        },
      });

    if (existingDispute) {
      throw new ForbiddenException("There is already an active dispute for this grade")
    }

    const dispute = this.gradeDisputeRepository.create({
      gradebookEntry: entry,
      student,
      reason: createGradeDisputeDto.reason,
      evidence: createGradeDisputeDto.evidence,
      proposedScore: createGradeDisputeDto.proposedScore,
      proposedLetterGrade: createGradeDisputeDto.proposedLetterGrade,
      status: "pending",
    })

    return this.gradeDisputeRepository.save(dispute)
  }

  async findAll(status?: string, courseId?: string, studentId?: string): Promise<GradeDispute[]> {
    const query = this.gradeDisputeRepository
      .createQueryBuilder("dispute")
      .leftJoinAndSelect("dispute.gradebookEntry", "entry")
      .leftJoinAndSelect("entry.course", "course")
      .leftJoinAndSelect("dispute.student", "student")
      .leftJoinAndSelect("dispute.reviewedBy", "reviewer")

    if (status) {
      query.andWhere("dispute.status = :status", { status })
    }

    if (courseId) {
      query.andWhere("course.id = :courseId", { courseId })
    }

    if (studentId) {
      query.andWhere("student.id = :studentId", { studentId })
    }

    return query.getMany()
  }

  async findOne(id: string): Promise<GradeDispute> {
    const dispute = await this.gradeDisputeRepository.findOne({
      where: { id },
      relations: ["gradebookEntry", "gradebookEntry.course", "student", "reviewedBy"],
    })

    if (!dispute) {
      throw new NotFoundException(`Grade dispute with ID ${id} not found`)
    }

    return dispute
  }

  async update(id: string, updateGradeDisputeDto: UpdateGradeDisputeDto, currentUser: User): Promise<GradeDispute> {
    const dispute = await this.findOne(id)

    if (updateGradeDisputeDto.reviewedById) {
        const reviewer = await this.userRepository.findOne({ where: { id: Number(updateGradeDisputeDto.reviewedById) } });
        if (!reviewer) {
          throw new NotFoundException(`User with ID ${updateGradeDisputeDto.reviewedById} not found`);
        }
        dispute.reviewedBy = reviewer;
    } else if (updateGradeDisputeDto.status) {
      // If status is being updated, set the current user as reviewer
      dispute.reviewedBy = currentUser
    }

    Object.assign(dispute, {
      status: updateGradeDisputeDto.status !== undefined ? updateGradeDisputeDto.status : dispute.status,
      resolution:
        updateGradeDisputeDto.resolution !== undefined ? updateGradeDisputeDto.resolution : dispute.resolution,
    })

    return this.gradeDisputeRepository.save(dispute)
  }

  async remove(id: string): Promise<void> {
    const dispute = await this.findOne(id)
    await this.gradeDisputeRepository.remove(dispute)
  }
}
