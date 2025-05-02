import { Injectable } from '@nestjs/common';
import { CreateRealTimeNotificationDto } from './dto/create-real-time-notification.dto';
import { UpdateRealTimeNotificationDto } from './dto/update-real-time-notification.dto';

@Injectable()
export class RealTimeNotificationService {
  create(createRealTimeNotificationDto: CreateRealTimeNotificationDto) {
    return 'This action adds a new realTimeNotification';
  }

  findAll() {
    return `This action returns all realTimeNotification`;
  }

  findOne(id: number) {
    return `This action returns a #${id} realTimeNotification`;
  }

  update(id: number, updateRealTimeNotificationDto: UpdateRealTimeNotificationDto) {
    return `This action updates a #${id} realTimeNotification`;
  }

  remove(id: number) {
    return `This action removes a #${id} realTimeNotification`;
  }
}
