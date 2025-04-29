import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import type { Repository } from "typeorm"
import { Guardian } from "../entities/guardian.entity"
import { GuardianRelationship } from "../entities/guardian-relationship.entity"
import { PermissionGrant } from "../entities/permission-grant.entity"
import { ProgressSnapshot } from "../entities/progress-snapshot.entity"
import { GuardianMessage } from "../entities/guardian-message.entity"
import { GuardianNotification } from "../entities/guardian-notification.entity"
import { DependentGroup } from "../entities/dependent-group.entity"
import { CreateGuardianDto } from "../dto/create-guardian.dto"
import { CreateRelationshipDto } from "../dto/create-relationship.dto"
import { CreateMessageDto } from "../dto/create-message.dto"
import { UpdatePermissionDto } from "../dto/update-permission.dto"

@Injectable()
export class GuardianService {
  constructor(
    @InjectRepository(Guardian)
    private readonly guardianRepository: Repository<Guardian>,
    @InjectRepository(GuardianRelationship)
    private readonly relationshipRepository: Repository<GuardianRelationship>,
    @InjectRepository(PermissionGrant)
    private readonly permissionRepository: Repository<PermissionGrant>,
    @InjectRepository(ProgressSnapshot)
    private progressRepository: Repository<ProgressSnapshot>,
    @InjectRepository(GuardianMessage)
    private messageRepository: Repository<GuardianMessage>,
    @InjectRepository(GuardianNotification)
    private notificationRepository: Repository<GuardianNotification>,
    @InjectRepository(DependentGroup)
    private dependentGroupRepository: Repository<DependentGroup>,
  ) {}

  async createGuardian(createGuardianDto: CreateGuardianDto): Promise<Guardian> {
    // Check if guardian with email already exists
    const existingGuardian = await this.guardianRepository.findOne({
      where: { email: createGuardianDto.email },
    })

    if (existingGuardian) {
      throw new BadRequestException("Guardian with this email already exists")
    }

    const guardian = this.guardianRepository.create(createGuardianDto)
    return this.guardianRepository.save(guardian)
  }

  async findGuardianById(id: string): Promise<Guardian> {
    const guardian = await this.guardianRepository.findOne({
      where: { id },
      relations: ["relationships", "dependentGroups"],
    })

    if (!guardian) {
      throw new NotFoundException(`Guardian with ID ${id} not found`)
    }

    return guardian
  }

  async getDependents(guardianId: string): Promise<GuardianRelationship[]> {
    const relationships = await this.relationshipRepository.find({
      where: { guardianId },
      relations: ["permissions"],
    })

    if (!relationships.length) {
      return []
    }

    return relationships
  }

  async createRelationship(
    guardianId: string,
    createRelationshipDto: CreateRelationshipDto,
  ): Promise<GuardianRelationship> {
    // Check if guardian exists
    const guardian = await this.guardianRepository.findOne({
      where: { id: guardianId },
    })

    if (!guardian) {
      throw new NotFoundException(`Guardian with ID ${guardianId} not found`)
    }

    // Check if relationship already exists
    const existingRelationship = await this.relationshipRepository.findOne({
      where: {
        guardianId,
        studentId: createRelationshipDto.studentId,
      },
    })

    if (existingRelationship) {
      throw new BadRequestException("Relationship already exists")
    }

    // Create the relationship
    const relationship = this.relationshipRepository.create({
      guardianId,
      studentId: createRelationshipDto.studentId,
      relationshipType: createRelationshipDto.relationshipType,
    })

    const savedRelationship = await this.relationshipRepository.save(relationship)

    // Create default permissions
    const defaultPermissions = [
      "view_grades",
      "view_attendance",
      "view_assignments",
      "contact_instructors",
      "receive_notifications",
    ]

    for (const permissionType of defaultPermissions) {
      await this.permissionRepository.save({
        relationshipId: savedRelationship.id,
        permissionType,
        isGranted: true,
      })
    }

    return savedRelationship
  }

  async getStudentProgress(guardianId: string, studentId: string): Promise<ProgressSnapshot[]> {
    // Check if relationship exists and has permission
    const relationship = await this.relationshipRepository.findOne({
      where: {
        guardianId,
        studentId,
      },
      relations: ["permissions"],
    })

    if (!relationship) {
      throw new NotFoundException(`Relationship between guardian ${guardianId} and student ${studentId} not found`)
    }

    // Check if guardian has permission to view grades
    const hasPermission = relationship.permissions.some((p) => p.permissionType === "view_grades" && p.isGranted)

    if (!hasPermission) {
      throw new BadRequestException("Guardian does not have permission to view grades")
    }

    // Get progress snapshots
    return this.progressRepository.find({
      where: { studentId },
      order: { snapshotDate: "DESC" },
    })
  }

  async sendMessage(guardianId: string, createMessageDto: CreateMessageDto): Promise<GuardianMessage> {
    // Check if guardian exists
    const guardian = await this.guardianRepository.findOne({
      where: { id: guardianId },
    })

    if (!guardian) {
      throw new NotFoundException(`Guardian with ID ${guardianId} not found`)
    }

    // Check if relationship exists and has permission
    const relationship = await this.relationshipRepository.findOne({
      where: {
        guardianId,
        studentId: createMessageDto.studentId,
      },
      relations: ["permissions"],
    })

    if (!relationship) {
      throw new NotFoundException(
        `Relationship between guardian ${guardianId} and student ${createMessageDto.studentId} not found`,
      )
    }

    // Check if guardian has permission to contact instructors
    const hasPermission = relationship.permissions.some(
      (p) => p.permissionType === "contact_instructors" && p.isGranted,
    )

    if (!hasPermission) {
      throw new BadRequestException("Guardian does not have permission to contact instructors")
    }

    // Create and save the message
    const message = this.messageRepository.create({
      guardianId,
      instructorId: createMessageDto.instructorId,
      studentId: createMessageDto.studentId,
      subject: createMessageDto.subject,
      content: createMessageDto.content,
      sentByGuardian: true,
    })

    return this.messageRepository.save(message)
  }

  async getNotifications(guardianId: string): Promise<GuardianNotification[]> {
    return this.notificationRepository.find({
      where: { guardianId },
      order: { createdAt: "DESC" },
    })
  }

  async updatePermission(guardianId: string, updatePermissionDto: UpdatePermissionDto): Promise<PermissionGrant> {
    // Check if relationship belongs to guardian
    const relationship = await this.relationshipRepository.findOne({
      where: {
        id: updatePermissionDto.relationshipId,
        guardianId,
      },
    })

    if (!relationship) {
      throw new NotFoundException(`Relationship not found or does not belong to guardian ${guardianId}`)
    }

    // Find the permission
    let permission = await this.permissionRepository.findOne({
      where: {
        relationshipId: updatePermissionDto.relationshipId,
        permissionType: updatePermissionDto.permissionType,
      },
    })

    // If permission doesn't exist, create it
    if (!permission) {
      permission = this.permissionRepository.create({
        relationshipId: updatePermissionDto.relationshipId,
        permissionType: updatePermissionDto.permissionType,
        isGranted: updatePermissionDto.isGranted,
      })
    } else {
      // Update existing permission
      permission.isGranted = updatePermissionDto.isGranted
    }

    return this.permissionRepository.save(permission)
  }
}
