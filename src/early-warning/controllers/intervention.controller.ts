import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import { CreateInterventionDto, UpdateInterventionDto } from '../dtos/intervention.dto';
import { Intervention } from '../entities/intervention.entity';
import { PrivacyService } from '../services/privacy.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@ApiTags('interventions')
@Controller('interventions')
@UseGuards(PrivacyService)
export class InterventionController {
  constructor(
    @InjectModel(Intervention.name) private readonly interventionModel: Model<Intervention>,
    private readonly privacyService: PrivacyService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new intervention' })
  async create(@Body() createInterventionDto: CreateInterventionDto): Promise<Intervention> {
    const createdIntervention = new this.interventionModel(createInterventionDto);
    return createdIntervention.save();
  }

  @Get()
  @ApiOperation({ summary: 'Get all interventions' })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @ApiQuery({ name: 'type', required: false })
  @ApiQuery({ name: 'method', required: false })
  async findAll(
    @Query('isActive') isActive?: boolean,
    @Query('type') type?: string,
    @Query('method') method?: string,
  ): Promise<Intervention[]> {
    const query: any = {};
    
    if (isActive !== undefined) {
      query.isActive = isActive;
    }
    
    if (type) {
      query.type = type;
    }
    
    if (method) {
      query.method = method;
    }
    
    return this.interventionModel.find(query).exec();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an intervention by id' })
  @ApiParam({ name: 'id', description: 'Intervention ID' })
  async findOne(@Param('id') id: string): Promise<Intervention> {
    return this.interventionModel.findById(id).exec();
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an intervention' })
  @ApiParam({ name: 'id', description: 'Intervention ID' })
  async update(
    @Param('id') id: string,
    @Body() updateInterventionDto: UpdateInterventionDto,
  ): Promise<Intervention> {
    return this.interventionModel
      .findByIdAndUpdate(id, updateInterventionDto, { new: true })
      .exec();
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an intervention' })
  @ApiParam({ name: 'id', description: 'Intervention ID' })
  async remove(@Param('id') id: string): Promise<Intervention> {
    return this.interventionModel.findByIdAndRemove(id).exec();
  }
}