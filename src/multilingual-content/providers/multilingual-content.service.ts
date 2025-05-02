import { Injectable } from '@nestjs/common';
import { CreateMultilingualContentDto } from './dto/create-multilingual-content.dto';
import { UpdateMultilingualContentDto } from './dto/update-multilingual-content.dto';

@Injectable()
export class MultilingualContentService {
  create(createMultilingualContentDto: CreateMultilingualContentDto) {
    return 'This action adds a new multilingualContent';
  }

  findAll() {
    return `This action returns all multilingualContent`;
  }

  findOne(id: number) {
    return `This action returns a #${id} multilingualContent`;
  }

  update(id: number, updateMultilingualContentDto: UpdateMultilingualContentDto) {
    return `This action updates a #${id} multilingualContent`;
  }

  remove(id: number) {
    return `This action removes a #${id} multilingualContent`;
  }
}
