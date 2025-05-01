import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AdmissionService } from './admission.service';
import { CreateAdmissionDto } from './dto/create-admission.dto';
import { UpdateAdmissionDto } from './dto/update-admission.dto';

@Controller('admission')
export class AdmissionController {
  constructor(private readonly admissionService: AdmissionService) {}

  @Post()
  create(@Body() createAdmissionDto: CreateAdmissionDto) {
    return this.admissionService.create(createAdmissionDto);
  }

  @Get()
  findAll() {
    return this.admissionService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.admissionService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAdmissionDto: UpdateAdmissionDto) {
    return this.admissionService.update(+id, updateAdmissionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.admissionService.remove(+id);
  }
}
