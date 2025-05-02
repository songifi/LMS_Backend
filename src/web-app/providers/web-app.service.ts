import { Injectable } from '@nestjs/common';
import { CreateWebAppDto } from './dto/create-web-app.dto';
import { UpdateWebAppDto } from './dto/update-web-app.dto';

@Injectable()
export class WebAppService {
  create(createWebAppDto: CreateWebAppDto) {
    return 'This action adds a new webApp';
  }

  findAll() {
    return `This action returns all webApp`;
  }

  findOne(id: number) {
    return `This action returns a #${id} webApp`;
  }

  update(id: number, updateWebAppDto: UpdateWebAppDto) {
    return `This action updates a #${id} webApp`;
  }

  remove(id: number) {
    return `This action removes a #${id} webApp`;
  }
}
