import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { CreateEvaluationPeriodDto } from '../dto/create-evaluation-period.dto';
import { EvaluationPeriod } from '../entities/evaluation-period.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { EvaluationPeriodService } from '../providers/evaluation-period.service';

@ApiTags('evaluation-periods')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('evaluation-periods')
export class EvaluationPeriodController {
  constructor(private readonly evaluationPeriodService: EvaluationPeriodService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new evaluation period' })
  @ApiResponse({ status: 201, description: 'The evaluation period has been created', type: EvaluationPeriod })
  create(@Body() createEvaluationPeriodDto: CreateEvaluationPeriodDto): Promise<EvaluationPeriod> {
    return this.evaluationPeriodService.create(createEvaluationPeriodDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all evaluation periods' })
  @ApiResponse({ status: 200, description: 'Return all evaluation periods', type: [EvaluationPeriod] })
  findAll(): Promise<EvaluationPeriod[]> {
    return this.evaluationPeriodService.findAll();
  }

  @Get('active')
  @ApiOperation({ summary: 'Get active evaluation periods' })
  @ApiResponse({ status: 200, description: 'Return active evaluation periods', type: [EvaluationPeriod] })
  findActive(): Promise<EvaluationPeriod[]> {
    return this.evaluationPeriodService.findActive();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific evaluation period' })
  @ApiParam({ name: 'id', description: 'Evaluation Period ID' })
  @ApiResponse({ status: 200, description: 'Return the evaluation period', type: EvaluationPeriod })
  findOne(@Param('id') id: string): Promise<EvaluationPeriod> {
    return this.evaluationPeriodService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an evaluation period' })
  @ApiParam({ name: 'id', description: 'Evaluation Period ID' })
  @ApiResponse({ status: 200, description: 'The evaluation period has been updated', type: EvaluationPeriod })
  update(
    @Param('id') id: string,
    @Body() updateEvaluationPeriodDto: Partial<CreateEvaluationPeriodDto>,
  ): Promise<EvaluationPeriod> {
    return this.evaluationPeriodService.update(id, updateEvaluationPeriodDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an evaluation period' })
  @ApiParam({ name: 'id', description: 'Evaluation Period ID' })
  @ApiResponse({ status: 200, description: 'The evaluation period has been deleted' })
  remove(@Param('id') id: string): Promise<void> {
    return this.evaluationPeriodService.remove(id);
  }
}