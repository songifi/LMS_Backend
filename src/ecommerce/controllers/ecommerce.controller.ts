import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { EcommerceService } from '../providers/ecommerce.service';
import { CreateDiscountDto } from '../dto/create-ecommerce.dto';
import { UpdateEcommerceDto } from '../dto/update-ecommerce.dto';

@Controller('ecommerce')
export class EcommerceController {
  constructor(private readonly ecommerceService: EcommerceService) {}

  @Post()
  create(@Body() createEcommerceDto: CreateDiscountDto) {
    return this.ecommerceService.create(createEcommerceDto);
  }

  @Get()
  findAll() {
    return this.ecommerceService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ecommerceService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEcommerceDto: UpdateEcommerceDto) {
    return this.ecommerceService.update(+id, updateEcommerceDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ecommerceService.remove(+id);
  }
}
