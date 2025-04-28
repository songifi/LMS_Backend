import { Injectable, NotFoundException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import type { Repository } from "typeorm"
import { NotificationTemplate, type DeliveryChannel } from "../entities/notification-template.entity"
import { NotificationType } from "../entities/notification-type.entity"

@Injectable()
export class NotificationTemplateService {
  constructor(
    @InjectRepository(NotificationTemplate)
    private templateRepository: Repository<NotificationTemplate>,
    @InjectRepository(NotificationType)
    private typeRepository: Repository<NotificationType>,
  ) { }

  async getTemplateForTypeAndChannel(typeId: string, channel: DeliveryChannel): Promise<NotificationTemplate | null> {
    return this.templateRepository.findOne({
      where: {
        typeId,
        channel,
        isActive: true,
      },
    })
  }

  async createTemplate(
    typeId: string,
    channel: DeliveryChannel,
    title: string,
    template: string,
  ): Promise<NotificationTemplate> {
    // Check if type exists
    const type = await this.typeRepository.findOneBy({ id: typeId })
    if (!type) {
      throw new NotFoundException(`Notification type with ID ${typeId} not found`)
    }

    // Check if template already exists
    const existingTemplate = await this.templateRepository.findOne({
      where: {
        typeId,
        channel,
      },
    })

    if (existingTemplate) {
      // Update existing template
      existingTemplate.title = title
      existingTemplate.template = template
      existingTemplate.isActive = true
      return this.templateRepository.save(existingTemplate)
    }

    // Create new template
    const newTemplate = this.templateRepository.create({
      typeId,
      channel,
      title,
      template,
      isActive: true,
    })

    return this.templateRepository.save(newTemplate)
  }

  async renderTemplate(
    template: NotificationTemplate,
    data: Record<string, any>,
  ): Promise<{ title: string; body: string }> {
    // Simple template rendering with variable substitution
    let renderedTitle = template.title
    let renderedBody = template.template

    // Replace variables in the format {{variableName}}
    Object.entries(data).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, "g")
      renderedTitle = renderedTitle.replace(regex, String(value))
      renderedBody = renderedBody.replace(regex, String(value))
    })

    return {
      title: renderedTitle,
      body: renderedBody,
    }
  }
}
