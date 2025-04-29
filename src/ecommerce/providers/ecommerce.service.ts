import { Injectable } from '@nestjs/common';
import { CreateDiscountDto } from '../dto/create-ecommerce.dto';
import { UpdateEcommerceDto } from '../dto/update-ecommerce.dto';

@Injectable()
export class EcommerceService {
  create(createEcommerceDto: CreateDiscountDto) {
    return 'This action adds a new ecommerce';
  }

  findAll() {
    return `This action returns all ecommerce`;
  }

  findOne(id: number) {
    return `This action returns a #${id} ecommerce`;
  }

  update(id: number, updateEcommerceDto: UpdateEcommerceDto) {
    return `This action updates a #${id} ecommerce`;
  }

  remove(id: number) {
    return `This action removes a #${id} ecommerce`;
  }
}
