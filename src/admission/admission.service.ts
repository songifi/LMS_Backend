import { Injectable } from '@nestjs/common';
import { CreateAdmissionDto } from './dto/create-admission.dto';
import { UpdateAdmissionDto } from './dto/update-admission.dto';

@Injectable()
export class AdmissionService {
  create(createAdmissionDto: CreateAdmissionDto) {
    return 'This action adds a new admission';
  }

  findAll() {
    return `This action returns all admission`;
  }

  findOne(id: number) {
    return `This action returns a #${id} admission`;
  }

  update(id: number, updateAdmissionDto: UpdateAdmissionDto) {
    return `This action updates a #${id} admission`;
  }

  remove(id: number) {
    return `This action removes a #${id} admission`;
  }
}
