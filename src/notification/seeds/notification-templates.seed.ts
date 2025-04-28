import { type NotificationTemplate, DeliveryChannel } from "../entities/notification-template.entity"
import type { Repository } from "typeorm"
import type { NotificationType } from "../entities/notification-type.entity"

export const seedNotificationTemplates = async (
  templateRepository: Repository<NotificationTemplate>,
  typeRepository: Repository<NotificationType>,
) => {
  const types = await typeRepository.find()
  const typeMap = new Map(types.map((type) => [type.code, type]))

  const templates = [
    // Course Enrollment Templates
    {
      typeCode: "COURSE_ENROLLMENT",
      channel: DeliveryChannel.IN_APP,
      title: "Course Enrollment",
      template: "You have been {{status}} in {{courseName}}.",
    },
    {
      typeCode: "COURSE_ENROLLMENT",
      channel: DeliveryChannel.EMAIL,
      title: "Course Enrollment Update",
      template: `
        <h2>Course Enrollment Update</h2>
        <p>Dear {{firstName}},</p>
        <p>You have been {{status}} in <strong>{{courseName}}</strong>.</p>
        <p>Please log in to your account to view more details.</p>
        <p>Thank you,<br>LMS Team</p>
      `,
    },

    // Assignment Due Templates
    {
      typeCode: "ASSIGNMENT_DUE",
      channel: DeliveryChannel.IN_APP,
      title: "Assignment Due Soon",
      template: "{{assignmentName}} is due on {{dueDate}}.",
    },
    {
      typeCode: "ASSIGNMENT_DUE",
      channel: DeliveryChannel.EMAIL,
      title: "Assignment Due Reminder",
      template: `
        <h2>Assignment Due Reminder</h2>
        <p>Dear {{firstName}},</p>
        <p>This is a reminder that <strong>{{assignmentName}}</strong> for <strong>{{courseName}}</strong> is due on <strong>{{dueDate}}</strong>.</p>
        <p>Please log in to your account to submit your work.</p>
        <p>Thank you,<br>LMS Team</p>
      `,
    },

    // Grade Posted Templates
    {
      typeCode: "GRADE_POSTED",
      channel: DeliveryChannel.IN_APP,
      title: "Grade Posted",
      template: "Your grade for {{assignmentName}} has been posted.",
    },
    {
      typeCode: "GRADE_POSTED",
      channel: DeliveryChannel.EMAIL,
      title: "New Grade Posted",
      template: `
        <h2>New Grade Posted</h2>
        <p>Dear {{firstName}},</p>
        <p>Your grade for <strong>{{assignmentName}}</strong> in <strong>{{courseName}}</strong> has been posted.</p>
        <p>Please log in to your account to view your grade and feedback.</p>
        <p>Thank you,<br>LMS Team</p>
      `,
    },

    // Forum Activity Templates
    {
      typeCode: "FORUM_ACTIVITY",
      channel: DeliveryChannel.IN_APP,
      title: "Forum Activity",
      template: "{{actorName}} {{activityType}} in {{forumName}}.",
    },
    {
      typeCode: "FORUM_ACTIVITY",
      channel: DeliveryChannel.EMAIL,
      title: "Forum Activity Update",
      template: `
        <h2>Forum Activity Update</h2>
        <p>Dear {{firstName}},</p>
        <p><strong>{{actorName}}</strong> {{activityType}} in the forum <strong>{{forumName}}</strong> for <strong>{{courseName}}</strong>.</p>
        <p>Please log in to your account to view and respond.</p>
        <p>Thank you,<br>LMS Team</p>
      `,
    },
  ]

  for (const template of templates) {
    const type = typeMap.get(template.typeCode)

    if (!type) {
      console.warn(`Notification type ${template.typeCode} not found`)
      continue
    }

    const existingTemplate = await templateRepository.findOne({
      where: {
        typeId: type.id,
        channel: template.channel,
      },
    })

    if (!existingTemplate) {
      await templateRepository.save(
        templateRepository.create({
          typeId: type.id,
          channel: template.channel,
          title: template.title,
          template: template.template,
          isActive: true,
        }),
      )
    }
  }
}
