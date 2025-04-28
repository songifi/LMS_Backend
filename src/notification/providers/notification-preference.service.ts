import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import type { Repository } from "typeorm"
import { NotificationPreference } from "../entities/notification-preference.entity"
import { NotificationType } from "../entities/notification-type.entity"
import { DeliveryChannel } from "../entities/notification-template.entity"
import type { NotificationPreferenceDto } from "../dto/notification-preference.dto"

@Injectable()
export class NotificationPreferenceService {
  constructor(
    @InjectRepository(NotificationPreference)
    private preferenceRepository: Repository<NotificationPreference>,
    @InjectRepository(NotificationType)
    private typeRepository: Repository<NotificationType>,
  ) { }

  async getUserPreferences(userId: string): Promise<NotificationPreference[]> {
    return this.preferenceRepository.find({
      where: { userId },
      relations: ["type"],
    })
  }

  async getUserPreferencesForType(userId: string, typeId: string): Promise<NotificationPreference[]> {
    return this.preferenceRepository.find({
      where: { userId, typeId },
    })
  }

  async updatePreferences(userId: string, preferences: NotificationPreferenceDto[]): Promise<NotificationPreference[]> {
    const updatedPreferences: NotificationPreference[] = []

    for (const pref of preferences) {
      // Find existing preference
      let preference = await this.preferenceRepository.findOne({
        where: {
          userId,
          typeId: pref.typeId,
          channel: pref.channel,
        },
      })

      if (preference) {
        // Update existing preference
        preference.enabled = pref.enabled
      } else {
        // Create new preference
        preference = this.preferenceRepository.create({
          userId,
          typeId: pref.typeId,
          channel: pref.channel,
          enabled: pref.enabled,
        })
      }

      updatedPreferences.push(await this.preferenceRepository.save(preference))
    }

    return updatedPreferences
  }

  async initializeUserPreferences(userId: string): Promise<NotificationPreference[]> {
    // Get all notification types
    const types = await this.typeRepository.find({ where: { isActive: true } })

    const preferences: NotificationPreference[] = []

    // Create default preferences for each type and channel
    for (const type of types) {
      for (const channel of Object.values(DeliveryChannel)) {
        // Skip if preference already exists
        const existingPref = await this.preferenceRepository.findOne({
          where: {
            userId,
            typeId: type.id,
            channel,
          },
        })

        if (!existingPref) {
          const preference = this.preferenceRepository.create({
            userId,
            typeId: type.id,
            channel,
            enabled: type.isDefault, // Use the default setting from the notification type
          })

          preferences.push(await this.preferenceRepository.save(preference))
        } else {
          preferences.push(existingPref)
        }
      }
    }

    return preferences
  }
}
