import { Injectable } from "@nestjs/common"
import type { NotificationService } from "../providers/notification.service"
import { NotificationType } from "../entities/notification-type.entity"
import { InjectRepository } from "@nestjs/typeorm"
import type { Repository } from "typeorm"
import { NotificationPriority } from "../enums/notificationPriority.enum"

@Injectable()
export class NotificationHelper {
  constructor(
    private notificationService: NotificationService,
    @InjectRepository(NotificationType)
    private notificationTypeRepository: Repository<NotificationType>,
  ) {}

  async sendCourseEnrollmentNotification(userId: string, courseName: string, status: string): Promise<void> {
    const type = await this.notificationTypeRepository.findOneBy({ code: "COURSE_ENROLLMENT" })

    if (!type) {
      throw new Error("Notification type COURSE_ENROLLMENT not found")
    }

    await this.notificationService.create({
      userId,
      typeId: type.id,
      title: "Course Enrollment",
      message: `You have been ${status} in ${courseName}.`,
      data: {
        courseName,
        status,
      },
      priority: NotificationPriority.MEDIUM,
    })
  }

  async sendAssignmentDueNotification(
    userId: string,
    assignmentName: string,
    courseName: string,
    dueDate: string,
  ): Promise<void> {
    const type = await this.notificationTypeRepository.findOneBy({ code: "ASSIGNMENT_DUE" })

    if (!type) {
      throw new Error("Notification type ASSIGNMENT_DUE not found")
    }

    await this.notificationService.create({
      userId,
      typeId: type.id,
      title: "Assignment Due Soon",
      message: `${assignmentName} is due on ${dueDate}.`,
      data: {
        assignmentName,
        courseName,
        dueDate,
      },
      priority: NotificationPriority.HIGH,
    })
  }

  async sendGradePostedNotification(userId: string, assignmentName: string, courseName: string): Promise<void> {
    const type = await this.notificationTypeRepository.findOneBy({ code: "GRADE_POSTED" })

    if (!type) {
      throw new Error("Notification type GRADE_POSTED not found")
    }

    await this.notificationService.create({
      userId,
      typeId: type.id,
      title: "Grade Posted",
      message: `Your grade for ${assignmentName} has been posted.`,
      data: {
        assignmentName,
        courseName,
      },
      priority: NotificationPriority.MEDIUM,
    })
  }

  async sendForumActivityNotification(
    userId: string,
    actorName: string,
    activityType: string,
    forumName: string,
    courseName: string,
  ): Promise<void> {
    const type = await this.notificationTypeRepository.findOneBy({ code: "FORUM_ACTIVITY" })

    if (!type) {
      throw new Error("Notification type FORUM_ACTIVITY not found")
    }

    await this.notificationService.create({
      userId,
      typeId: type.id,
      title: "Forum Activity",
      message: `${actorName} ${activityType} in ${forumName}.`,
      data: {
        actorName,
        activityType,
        forumName,
        courseName,
      },
      priority: NotificationPriority.LOW,
    })
  }

  async sendSessionReminderNotification(
    userId: string,
    sessionName: string,
    courseName: string,
    startTime: string,
  ): Promise<void> {
    const type = await this.notificationTypeRepository.findOneBy({ code: "SESSION_REMINDER" })

    if (!type) {
      throw new Error("Notification type SESSION_REMINDER not found")
    }

    await this.notificationService.create({
      userId,
      typeId: type.id,
      title: "Session Reminder",
      message: `Your session ${sessionName} for ${courseName} starts at ${startTime}.`,
      data: {
        sessionName,
        courseName,
        startTime,
      },
      priority: NotificationPriority.MEDIUM,
    })
  }
}
