import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { GradebookEntry } from "../entities/gradebook-entry.entity";
import { CreateGradebookEntryDto } from "../dto/create-gradebook-entry.dto";
import { UpdateGradebookEntryDto } from "../dto/update-gradebook-entry.dto";
import { User } from "src/user/entities/user.entity";
import { Assessment } from "src/assessment/entities/assessment.entity";
import { Grade } from "src/assessment/entities/grade.entity";
import { GradeCategory } from "../entities/grade-category.entity";
import { GradeCurve } from "../entities/grade-curve.entity";
import { GradeHistory } from "../entities/grade-history.entity";
import { GradeScaleService } from "./grade-scale.service";
import { GradeCurveService } from "./grade-curve.service";
import { GradebookService } from "./gradebook.service";

@Injectable()
export class GradebookEntryService {
  constructor(
    @InjectRepository(GradebookEntry)
    private gradebookEntryRepository: Repository<GradebookEntry>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Assessment)
    private assessmentRepository: Repository<Assessment>,
    @InjectRepository(Grade)
    private gradeRepository: Repository<Grade>,
    @InjectRepository(GradeCategory)
    private gradeCategoryRepository: Repository<GradeCategory>,
    @InjectRepository(GradeCurve)
    private gradeCurveRepository: Repository<GradeCurve>,
    @InjectRepository(GradeHistory)
    private gradeHistoryRepository: Repository<GradeHistory>,
    private gradeScaleService: GradeScaleService,
    private gradeCurveService: GradeCurveService,
    private gradebookService: GradebookService
  ) {}

  async create(createGradebookEntryDto: CreateGradebookEntryDto, currentUser: User): Promise<GradebookEntry> {
    const student = await this.userRepository.findOne({
        where: { id: Number(createGradebookEntryDto.studentId) },
      });
      
    if (!student) {
      throw new NotFoundException(`Student with ID ${createGradebookEntryDto.studentId} not found`);
    }

    const category = await this.gradeCategoryRepository.findOne({ where: { id: createGradebookEntryDto.categoryId } });
    if (!category) {
      throw new NotFoundException(`Grade category with ID ${createGradebookEntryDto.categoryId} not found`);
    }

    const assessment = createGradebookEntryDto.assessmentId
      ? await this.assessmentRepository.findOne({ where: { id: createGradebookEntryDto.assessmentId } })
      : null;

    const appliedCurve = createGradebookEntryDto.appliedCurveId
      ? await this.gradeCurveRepository.findOne({ where: { id: createGradebookEntryDto.appliedCurveId } })
      : null;

    const rawScore = createGradebookEntryDto.rawScore;
    const possiblePoints = createGradebookEntryDto.possiblePoints;

    let adjustedScore = rawScore;
    if (appliedCurve) {
      const curvedPercentage = this.gradeCurveService.applyCurve(rawScore, possiblePoints, appliedCurve);
      adjustedScore = (curvedPercentage / 100) * possiblePoints;
    }

    const percentage = (adjustedScore / possiblePoints) * 100;

    const entry = this.gradebookEntryRepository.create({
      student: { id: student.id },
      assessment: assessment ? { id: assessment.id } : undefined,
      category: { id: category.id },
      rawScore,
      possiblePoints,
      adjustedScore,
      percentage,
      appliedCurve: appliedCurve ? { id: appliedCurve.id } : undefined,
      isExcused: createGradebookEntryDto.isExcused || false,
      isExtraCredit: createGradebookEntryDto.isExtraCredit || false,
      comments: createGradebookEntryDto.comments,
      isPublished: createGradebookEntryDto.isPublished !== undefined ? createGradebookEntryDto.isPublished : true,
    });

    const savedEntry = await this.gradebookEntryRepository.save(entry);

    await this.createHistoryRecord(savedEntry, null, currentUser, "Initial grade entry");

    return savedEntry;
  }

  async findAll(courseId?: number, studentId?: number, categoryId?: number): Promise<GradebookEntry[]> {
    const query = this.gradebookEntryRepository
      .createQueryBuilder("entry")
      .leftJoinAndSelect("entry.student", "student")
      .leftJoinAndSelect("entry.assessment", "assessment")
      .leftJoinAndSelect("entry.category", "category")
      .leftJoinAndSelect("entry.appliedCurve", "appliedCurve");
  
    if (courseId) {
      query.andWhere("assessment.courseId = :courseId", { courseId });
    }
    if (studentId) {
      query.andWhere("student.id = :studentId", { studentId });
    }
    if (categoryId) {
      query.andWhere("category.id = :categoryId", { categoryId });
    }
  
    return query.getMany();
  }

  async calculateStudentGrades(courseId: number, studentId: number) {
    const entries = await this.gradebookEntryRepository
      .createQueryBuilder("entry")
      .leftJoinAndSelect("entry.category", "category")
      .leftJoinAndSelect("entry.assessment", "assessment")
      .where("entry.student.id = :studentId", { studentId })
      .andWhere("assessment.courseId = :courseId", { courseId })
      .andWhere("entry.isPublished = true")
      .getMany();
  
    let totalScore = 0;
    let totalPossible = 0;
  
    entries.forEach((entry) => {
      if (!entry.isExcused) {
        totalScore += entry.adjustedScore ?? entry.rawScore;
        totalPossible += entry.possiblePoints;
      }
    });
  
    const percentage = totalPossible ? (totalScore / totalPossible) * 100 : 0;
  
    // ✅ Fetch the default grade scale instead of course scale
    const defaultScale = await this.gradeScaleService.findDefault();
  
    // ✅ Use the scale data from the default scale
    const letterGrade = this.gradeScaleService.getLetterGrade(percentage, defaultScale.scaleData);
  
    return {
      percentage: percentage.toFixed(2),
      letterGrade,
      totalScore,
      totalPossible,
    };
  }
  
  
  
  

  async findOne(id: number): Promise<GradebookEntry> {
    const entry = await this.gradebookEntryRepository.findOne({
        where: { id: String(id) },
      relations: ["student", "assessment", "category", "appliedCurve"],
    });

    if (!entry) {
      throw new NotFoundException(`Gradebook entry with ID ${id} not found`);
    }

    return entry;
  }

  async update(
    id: number,
    updateGradebookEntryDto: UpdateGradebookEntryDto,
    currentUser: User,
  ): Promise<GradebookEntry> {
    const entry = await this.findOne(id);
    const oldEntry = { ...entry };

    if (updateGradebookEntryDto.categoryId) {
      const category = await this.gradeCategoryRepository.findOne({ where: { id: updateGradebookEntryDto.categoryId } });
      if (!category) {
        throw new NotFoundException(`Grade category with ID ${updateGradebookEntryDto.categoryId} not found`);
      }
      entry.category = category;
    }

    if (updateGradebookEntryDto.assessmentId) {
      const assessment = await this.assessmentRepository.findOne({ where: { id: updateGradebookEntryDto.assessmentId } });
      if (!assessment) {
        throw new NotFoundException(`Assessment with ID ${updateGradebookEntryDto.assessmentId} not found`);
      }
      entry.assessment = assessment;
    }

    if (updateGradebookEntryDto.appliedCurveId) {
      const appliedCurve = await this.gradeCurveRepository.findOne({ where: { id: updateGradebookEntryDto.appliedCurveId } });
      if (!appliedCurve) {
        throw new NotFoundException(`Grade curve with ID ${updateGradebookEntryDto.appliedCurveId} not found`);
      }
      entry.appliedCurve = appliedCurve;
    }

    if (updateGradebookEntryDto.rawScore !== undefined) entry.rawScore = updateGradebookEntryDto.rawScore;
    if (updateGradebookEntryDto.possiblePoints !== undefined) entry.possiblePoints = updateGradebookEntryDto.possiblePoints;
    if (updateGradebookEntryDto.isExcused !== undefined) entry.isExcused = updateGradebookEntryDto.isExcused;
    if (updateGradebookEntryDto.isExtraCredit !== undefined) entry.isExtraCredit = updateGradebookEntryDto.isExtraCredit;
    if (updateGradebookEntryDto.comments !== undefined) entry.comments = updateGradebookEntryDto.comments;
    if (updateGradebookEntryDto.isPublished !== undefined) entry.isPublished = updateGradebookEntryDto.isPublished;

    // Recalculate
    let adjustedScore = entry.rawScore;
    if (entry.appliedCurve) {
      const curvedPercentage = this.gradeCurveService.applyCurve(entry.rawScore, entry.possiblePoints, entry.appliedCurve);
      adjustedScore = (curvedPercentage / 100) * entry.possiblePoints;
    }

    entry.adjustedScore = adjustedScore;
    entry.percentage = (adjustedScore / entry.possiblePoints) * 100;

    const updatedEntry = await this.gradebookEntryRepository.save(entry);

    await this.createHistoryRecord(updatedEntry, oldEntry, currentUser, "Grade updated");

    return updatedEntry;
  }

  async remove(id: number): Promise<void> {
    const entry = await this.findOne(id);
    await this.gradebookEntryRepository.remove(entry);
  }

  private async createHistoryRecord(
    newEntry: GradebookEntry,
    oldEntry: GradebookEntry | null,
    modifiedBy: User,
    reason: string,
  ): Promise<GradeHistory> {
    const history = this.gradeHistoryRepository.create({
      gradebookEntry: { id: newEntry.id },
      previousRawScore: oldEntry?.rawScore,
      newRawScore: newEntry.rawScore,
      previousAdjustedScore: oldEntry?.adjustedScore,
      newAdjustedScore: newEntry.adjustedScore,
      previousLetterGrade: oldEntry?.letterGrade,
      newLetterGrade: newEntry.letterGrade,
      reason,
      modifiedBy: { id: modifiedBy.id },
    });

    return this.gradeHistoryRepository.save(history);
  }

  async getGradeHistory(entryId: number): Promise<GradeHistory[]> {
    return this.gradeHistoryRepository.find({
    where: { gradebookEntry: { id: String(entryId) } },
      relations: ["modifiedBy"],
      order: { createdAt: "DESC" },
    });
  }
}
