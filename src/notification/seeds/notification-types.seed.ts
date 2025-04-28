import type { NotificationType } from "../entities/notification-type.entity"
import type { Repository } from "typeorm"

export const seedNotificationTypes = async (repository: Repository<NotificationType>) => {
  const types = [
    {
      code: "COURSE_ENROLLMENT",
      name: "Course Enrollment",
      description: "Notifications related to course enrollments",
      isActive: true,
      isDefault: true,
    },
    {
      code: "ASSIGNMENT_DUE",
      name: "Assignment Due",
      description: "Notifications for upcoming assignment deadlines",
      isActive: true,
      isDefault: true,
    },
    {
      code: "GRADE_POSTED",
      name: "Grade Posted",
      description: "Notifications when new grades are posted",
      isActive: true,
      isDefault: true,
    },
    {
      code: "FORUM_ACTIVITY",
      name: "Forum Activity",
      description: "Notifications for forum replies and mentions",
      isActive: true,
      isDefault: true,
    },
    {
      code: "COURSE_ANNOUNCEMENT",
      name: "Course Announcement",
      description: "Important announcements from course instructors",
      isActive: true,
      isDefault: true,
    },
    {
      code: "SESSION_REMINDER",
      name: "Session Reminder",
      description: "Reminders for upcoming course sessions",
      isActive: true,
      isDefault: true,
    },
    {
      code: "SYSTEM_ANNOUNCEMENT",
      name: "System Announcement",
      description: "System-wide announcements from administrators",
      isActive: true,
      isDefault: true,
    },
  ]

  for (const type of types) {
    const existingType = await repository.findOneBy({ code: type.code })

    if (!existingType) {
      await repository.save(repository.create(type))
    }
  }
}
