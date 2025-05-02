import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { AlgorithmsService } from './algorithms.service';
import { CreateAlgorithmDto } from './dto/create-algorithm.dto';
import { UpdateAlgorithmDto } from './dto/update-algorithm.dto';
import { Algorithm } from './entities/algorithm.entity';

@ApiTags('algorithms')
@Controller('algorithms')
export class AlgorithmsController {
  constructor(private readonly algorithmsService: AlgorithmsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new algorithm' })
  @ApiResponse({ status: 201, description: 'The algorithm has been successfully created.', type: Algorithm })
  create(@Body() createAlgorithmDto: CreateAlgorithmDto): Promise<Algorithm> {
    return this.algorithmsService.create(createAlgorithmDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all algorithms' })
  @ApiResponse({ status: 200, description: 'Return all algorithms.', type: [Algorithm] })
  findAll(): Promise<Algorithm[]> {
    return this.algorithmsService.findAll();
  }

  @Get('active')
  @ApiOperation({ summary: 'Get active algorithms' })
  @ApiResponse({ status: 200, description: 'Return active algorithms.', type: [Algorithm] })
  findActive(): Promise<Algorithm[]> {
    return this.algorithmsService.findActive();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an algorithm by ID' })
  @ApiParam({ name: 'id', description: 'Algorithm ID' })
  @ApiResponse({ status: 200, description: 'Return the algorithm.', type: Algorithm })
  @ApiResponse({ status: 404, description: 'Algorithm not found.' })
  findOne(@Param('id') id: string): Promise<Algorithm> {
    return this.algorithmsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an algorithm' })
  @ApiParam({ name: 'id', description: 'Algorithm ID' })
  @ApiResponse({ status: 200, description: 'The algorithm has been successfully updated.', type: Algorithm })
  @ApiResponse({ status: 404, description: 'Algorithm not found.' })
  update(
    @Param('id') id: string,
    @Body() updateAlgorithmDto: UpdateAlgorithmDto,
  ): Promise<Algorithm> {
    return this.algorithmsService.update(id, updateAlgorithmDto);
  }

  @Patch(':id/activate')
  @ApiOperation({ summary: 'Set an algorithm as active' })
  @ApiParam({ name: 'id', description: 'Algorithm ID' })
  @ApiResponse({ status: 200, description: 'The algorithm has been set as active.', type: Algorithm })
  @ApiResponse({ status: 404, description: 'Algorithm not found.' })
  setActive(@Param('id') id: string): Promise<Algorithm> {
    return this.algorithmsService.setActive(id);
  }

  @Patch(':id/metrics')
  @ApiOperation({ summary: 'Update algorithm metrics' })
  @ApiParam({ name: 'id', description: 'Algorithm ID' })
  @ApiResponse({ status: 200, description: 'The algorithm metrics have been updated.', type: Algorithm })
  @ApiResponse({ status: 404, description: 'Algorithm not found.' })
  updateMetrics(
    @Param('id') id: string,
    @Body() metrics: Record<string, any>,
  ): Promise<Algorithm> {
    return this.algorithmsService.updateMetrics(id, metrics);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an algorithm' })
  @ApiParam({ name: 'id', description: 'Algorithm ID' })
  @ApiResponse({ status: 200, description: 'The algorithm has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Algorithm not found.' })
  remove(@Param('id') id: string): Promise<void> {
    return this.algorithmsService.remove(id);
  }
}