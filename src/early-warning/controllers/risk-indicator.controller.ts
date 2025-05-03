import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import { CreateRiskIndicatorDto, UpdateRiskIndicatorDto } from '../dtos/risk-indicator.dto';
import { RiskIndicator } from '../entities/risk-indicator.entity';
import { PrivacyService } from '../services/privacy.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@ApiTags('risk-indicators')
@Controller('risk-indicators')
@UseGuards(PrivacyService)
export class RiskIndicatorController {
  constructor(
    @InjectModel(RiskIndicator.name) private readonly riskIndicatorModel: Model<RiskIndicator>,
    private readonly privacyService: PrivacyService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new risk indicator' })
  async create(@Body() createRiskIndicatorDto: CreateRiskIndicatorDto): Promise<RiskIndicator> {
    const createdRiskIndicator = new this.riskIndicatorModel(createRiskIndicatorDto);
    return createdRiskIndicator.save();
  }

  @Get()
  @ApiOperation({ summary: 'Get all risk indicators' })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @ApiQuery({ name: 'dataSource', required: false })
  @ApiQuery({ name: 'riskLevel', required: false })
  async findAll(
    @Query('isActive') isActive?: boolean,
    @Query('dataSource') dataSource?: string,
    @Query('riskLevel') riskLevel?: string,
  ): Promise<RiskIndicator[]> {
    const query: any = {};
    
    if (isActive !== undefined) {
      query.isActive = isActive;
    }
    
    if (dataSource) {
      query.dataSource = dataSource;
    }
    
    if (riskLevel) {
      query.riskLevel = riskLevel;
    }
    
    return this.riskIndicatorModel.find(query).exec();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a risk indicator by id' })
  @ApiParam({ name: 'id', description: 'Risk indicator ID' })
  async findOne(@Param('id') id: string): Promise<RiskIndicator> {
    return this.riskIndicatorModel.findById(id).exec();
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a risk indicator' })
  @ApiParam({ name: 'id', description: 'Risk indicator ID' })
  async update(
    @Param('id') id: string,
    @Body() updateRiskIndicatorDto: UpdateRiskIndicatorDto,
  ): Promise<RiskIndicator> {
    return this.riskIndicatorModel
      .findByIdAndUpdate(id, updateRiskIndicatorDto, { new: true })
      .exec();
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a risk indicator' })
  @ApiParam({ name: 'id', description: 'Risk indicator ID' })
  async remove(@Param('id') id: string): Promise<RiskIndicator> {
    return this.riskIndicatorModel.findByIdAndRemove(id).exec();
  }
}