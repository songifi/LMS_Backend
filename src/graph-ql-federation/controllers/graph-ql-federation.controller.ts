import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { GraphQlFederationService } from './graph-ql-federation.service';
import { CreateGraphQlFederationDto } from '../dto/create-graph-ql-federation.dto';
import { UpdateGraphQlFederationDto } from '../dto/update-graph-ql-federation.dto';

@Controller('graph-ql-federation')
export class GraphQlFederationController {
  constructor(private readonly graphQlFederationService: GraphQlFederationService) {}

  @Post()
  create(@Body() createGraphQlFederationDto: CreateGraphQlFederationDto) {
    return this.graphQlFederationService.create(createGraphQlFederationDto);
  }

  @Get()
  findAll() {
    return this.graphQlFederationService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.graphQlFederationService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateGraphQlFederationDto: UpdateGraphQlFederationDto) {
    return this.graphQlFederationService.update(+id, updateGraphQlFederationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.graphQlFederationService.remove(+id);
  }
}
