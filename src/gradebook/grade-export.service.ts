import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import type { Repository } from "typeorm"
import { GradebookEntry } from "./entities/gradebook-entry.entity"
import { GradeCategory } from "./entities/grade-category.entity"
import { GradebookEntryService } from "./providers/gradebook-entry.service"
import { ExportGradesDto } from "./dto/export-grades.dto"

@Injectable()
export class GradeExportService {
  constructor(
    @InjectRepository(GradebookEntry)
    private gradebookEntryRepository: Repository<GradebookEntry>,
    @InjectRepository(GradeCategory)
    private gradeCategoryRepository: Repository<GradeCategory>,
    private gradebookEntryService: GradebookEntryService,
  ) {}

  async exportGrades(exportDto: ExportGradesDto): Promise<any> {
    // No more course lookup!!

    const query = this.gradebookEntryRepository
      .createQueryBuilder("entry")
      .leftJoinAndSelect("entry.student", "student")
      .leftJoinAndSelect("entry.category", "category")
      .leftJoinAndSelect("entry.assessment", "assessment")

    // Filter by students if specified
    if (exportDto.studentIds && exportDto.studentIds.length > 0) {
      query.andWhere("student.id IN (:...studentIds)", { studentIds: exportDto.studentIds })
    }

    // Filter by categories if specified
    if (exportDto.categoryIds && exportDto.categoryIds.length > 0) {
      query.andWhere("category.id IN (:...categoryIds)", { categoryIds: exportDto.categoryIds })
    }

    const entries = await query.getMany()

    const studentEntries = {}
    for (const entry of entries) {
      const studentId = entry.student.id
      if (!studentEntries[studentId]) {
        studentEntries[studentId] = {
          studentId,
          studentName: `${entry.student.firstName} ${entry.student.lastName}`,
          studentEmail: entry.student.email,
          entries: [],
        }
      }
      studentEntries[studentId].entries.push(entry)
    }

    // (Optional) Calculate simple overall grades
    for (const studentId in studentEntries) {
      const entries = studentEntries[studentId].entries
      const total = entries.reduce((sum, entry) => sum + (entry.percentage || 0), 0)
      const average = entries.length ? total / entries.length : 0

      studentEntries[studentId].overallGrade = {
        overallPercentage: Number(average.toFixed(2)),
        overallLetterGrade: this.getLetterGrade(average),
      }
    }

    switch (exportDto.format) {
      case "csv":
        return this.formatAsCSV(studentEntries, exportDto.includeComments ?? false)
      case "excel":
        return this.formatAsExcel(studentEntries, exportDto.includeComments ?? false)
      case "pdf":
        return this.formatAsPDF(studentEntries, exportDto.includeComments ?? false)
      case "json":
      default:
        return studentEntries
    }
  }

  private getLetterGrade(percentage: number): string {
    if (percentage >= 90) return "A"
    if (percentage >= 80) return "B"
    if (percentage >= 70) return "C"
    if (percentage >= 60) return "D"
    return "F"
  }

  private formatAsCSV(studentEntries: any, includeComments: boolean): string {
    const allCategories = new Set<string>()
    for (const studentId in studentEntries) {
      for (const entry of studentEntries[studentId].entries) {
        allCategories.add(entry.category.name)
      }
    }

    let csv = "Student ID,Student Name,Student Email,"
    Array.from(allCategories).forEach((category) => {
      csv += `${category},`
    })
    csv += "Overall Percentage,Overall Letter Grade"
    if (includeComments) {
      csv += ",Comments"
    }
    csv += "\n"

    for (const studentId in studentEntries) {
      const student = studentEntries[studentId]
      csv += `${student.studentId},${student.studentName},${student.studentEmail},`

      const categoryGrades = {}
      for (const entry of student.entries) {
        if (!categoryGrades[entry.category.name]) {
          categoryGrades[entry.category.name] = []
        }
        categoryGrades[entry.category.name].push(entry.percentage)
      }

      Array.from(allCategories).forEach((category) => {
        const grades = categoryGrades[category] || []
        const average = grades.length > 0 ? grades.reduce((sum, grade) => sum + grade, 0) / grades.length : ""
        csv += `${average},`
      })

      csv += `${student.overallGrade.overallPercentage},${student.overallGrade.overallLetterGrade}`

      if (includeComments) {
        const comments = student.entries
          .filter((entry) => entry.comments)
          .map((entry) => `${entry.category.name}: ${entry.comments}`)
          .join("; ")
        csv += `,${comments}`
      }

      csv += "\n"
    }

    return csv
  }

  private formatAsExcel(studentEntries: any, includeComments: boolean): any {
    return {
      format: "excel",
      data: studentEntries,
      includeComments,
    }
  }

  private formatAsPDF(studentEntries: any, includeComments: boolean): any {
    return {
      format: "pdf",
      data: studentEntries,
      includeComments,
    }
  }
}
