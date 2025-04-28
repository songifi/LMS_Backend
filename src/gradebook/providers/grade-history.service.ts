import { Injectable, NotFoundException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import type { Repository } from "typeorm"
import { GradeHistory } from "../entities/grade-history.entity"
import { GradebookEntry } from "../entities/gradebook-entry.entity"

@Injectable()
export class GradeHistoryService {
  constructor(
    @InjectRepository(GradeHistory)
    private gradeHistoryRepository: Repository<GradeHistory>,
    @InjectRepository(GradebookEntry)
    private gradebookEntryRepository: Repository<GradebookEntry>
  ) { }

  async findByEntry(entryId: string): Promise<GradeHistory[]> {
    const entry = await this.gradebookEntryRepository.findOne({ where: { id: entryId } })
    if (!entry) {
      throw new NotFoundException(`Gradebook entry with ID ${entryId} not found`)
    }

    return this.gradeHistoryRepository.find({
      where: { gradebookEntry: { id: entryId } },
      relations: ["modifiedBy"],
      order: { createdAt: "DESC" },
    })
  }

  async findByCourse(courseId: string): Promise<GradeHistory[]> {
    return this.gradeHistoryRepository
      .createQueryBuilder("history")
      .leftJoinAndSelect("history.gradebookEntry", "entry")
      .leftJoinAndSelect("entry.course", "course")
      .leftJoinAndSelect("history.modifiedBy", "modifier")
      .where("course.id = :courseId", { courseId })
      .orderBy("history.createdAt", "DESC")
      .getMany()
  }

  async findByStudent(studentId: string): Promise<GradeHistory[]> {
    return this.gradeHistoryRepository
      .createQueryBuilder("history")
      .leftJoinAndSelect("history.gradebookEntry", "entry")
      .leftJoinAndSelect("entry.student", "student")
      .leftJoinAndSelect("history.modifiedBy", "modifier")
      .where("student.id = :studentId", { studentId })
      .orderBy("history.createdAt", "DESC")
      .getMany()
  }
}
