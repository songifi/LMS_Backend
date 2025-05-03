import { Injectable } from '@nestjs/common';
import { CreatePrivacyDto } from './dto/create-privacy.dto';
import { UpdatePrivacyDto } from './dto/update-privacy.dto';

@Injectable()
export class PrivacyService {
  create(createPrivacyDto: CreatePrivacyDto) {
    return 'This action adds a new privacy';
  }

  findAll() {
    return `This action returns all privacy`;
  }

  findOne(id: number) {
    return `This action returns a #${id} privacy`;
  }

  update(id: number, updatePrivacyDto: UpdatePrivacyDto) {
    return `This action updates a #${id} privacy`;
  }

  remove(id: number) {
    return `This action removes a #${id} privacy`;
  }
}
