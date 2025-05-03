import { Injectable } from '@nestjs/common';
import { CreateSecurityModuleDto } from './dto/create-security-module.dto';
import { UpdateSecurityModuleDto } from './dto/update-security-module.dto';

@Injectable()
export class SecurityModuleService {
  create(createSecurityModuleDto: CreateSecurityModuleDto) {
    return 'This action adds a new securityModule';
  }

  findAll() {
    return `This action returns all securityModule`;
  }

  findOne(id: number) {
    return `This action returns a #${id} securityModule`;
  }

  update(id: number, updateSecurityModuleDto: UpdateSecurityModuleDto) {
    return `This action updates a #${id} securityModule`;
  }

  remove(id: number) {
    return `This action removes a #${id} securityModule`;
  }
}
