import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { ApplicationFormService } from './application-form.service';
import { FormStatus } from './entities/application-form.entity';
import { UpdateForumDto } from 'src/discussion-forum/dto/update-discussion-forum.dto';

@ApiTags('application-forms')
@Controller('application-forms')
export class ApplicationFormController {
  constructor(private readonly formService: ApplicationFormService) {}

  @Get()
  @ApiQuery({ name: 'programId', required: false })
  @ApiQuery({ name: 'status', required: false, enum: FormStatus })
  @ApiQuery({ name: 'isDefault', required: false, type: Boolean })
  findAll(
    @Query('programId') programId?: string,
    @Query('status') status?: FormStatus,
    @Query('isDefault') isDefault?: string,
  ) {
    // Convert string 'isDefault' to boolean
    const isDefaultBool = isDefault ? isDefault === 'true' : undefined;
    
    // Fix: Convert string to boolean before passing to service
    return this.formService.findAll({ programId, status, isDefault: isDefaultBool });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.formService.findOne(id);
  }

  // @Post()
  // create(@Body() formData: CreateForumDto) {
  //   // Ensure fields and documentRequirements are properly typed to match service expectations
  //   return this.formService.create({
  //     name: formData.name,
  //     description: formData.description,
  //     programId: formData.programId,
  //     status: formData.status,
  //     isDefault: formData.isDefault,
  //     startDate: formData.startDate,
  //     endDate: formData.endDate,
  //     fields: formData.fields?.map(field => ({
  //       id: field.id || '', // Ensure id is always a string
  //       ...field,
  //     })),
  //     documentRequirements: formData.documentRequirements?.map(req => ({
  //       id: req.id || '', // Ensure id is always a string
  //       ...req,
  //     })),
  //   });
  // }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFormDto: UpdateForumDto) {
    return this.formService.update(id, updateFormDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.formService.remove(id);
  }

  @Get(':id/fields')
  getFields(@Param('id') id: string) {
    return this.formService.getFields(id);
  }

  @Post(':id/fields')
  addField(@Param('id') id: string, @Body() fieldData: any) {
    return this.formService.addField(id, fieldData);
  }

  @Patch(':id/fields/:fieldId')
  updateField(
    @Param('id') formId: string,
    @Param('fieldId') fieldId: string,
    @Body() fieldData: any,
  ) {
    return this.formService.updateField(formId, fieldId, fieldData);
  }

  // @Delete(':id/fields/:fieldId')
  // deleteField(
  //   @Param('id') formId: string,
  //   @Param('fieldId') fieldId: string,
  // ) {
  //   // Fix: Implement the deleteField method in the service
  //   return this.formService.deleteField(formId, fieldId);
  // }

  @Get(':id/document-requirements')
  getDocumentRequirements(@Param('id') id: string) {
    return this.formService.getDocumentRequirements(id);
  }

  @Post(':id/document-requirements')
  addDocumentRequirement(@Param('id') id: string, @Body() reqData: any) {
    return this.formService.addDocumentRequirement(id, reqData);
  }

  @Patch(':id/document-requirements/:reqId')
  updateDocumentRequirement(
    @Param('id') formId: string,
    @Param('reqId') reqId: string,
    @Body() reqData: any,
  ) {
    return this.formService.updateDocumentRequirement(formId, reqId, reqData);
  }

  // @Delete(':id/document-requirements/:reqId')
  // deleteDocumentRequirement(
  //   @Param('id') formId: string,
  //   @Param('reqId') reqId: string,
  // ) {
  //   return this.formService.deleteDocumentRequirement(formId, reqId);
  // }
}