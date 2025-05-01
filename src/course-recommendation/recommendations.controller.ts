import { Controller, Get, Post, Body, Param, Query, Patch } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { RecommendationsService } from './recommendations.service';
import { CreateRecommendationDto } from './dto/create-recommendation.dto';
import { GenerateRecommendationsDto } from './dto/generate-recommendations.dto';
import { RecommendationQueryDto } from './dto/recommendation-query.dto';
import { Recommendation } from './entities/recommendation.entity';

@ApiTags('recommendations')
@Controller('recommendations')
export class RecommendationsController {
  constructor(private readonly recommendationsService: RecommendationsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new recommendation' })
  @ApiResponse({ status: 201, description: 'The recommendation has been successfully created.', type: Recommendation })
  create(@Body() createRecommendationDto: CreateRecommendationDto): Promise<Recommendation> {
    return this.recommendationsService.create(createRecommendationDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get recommendations with filters' })
  @ApiResponse({ status: 200, description: 'Return recommendations matching the criteria.', type: [Recommendation] })
  findAll(@Query() query: RecommendationQueryDto): Promise<Recommendation[]> {
    return this.recommendationsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a recommendation by ID' })
  @ApiParam({ name: 'id', description: 'Recommendation ID' })
  @ApiResponse({ status: 200, description: 'Return the recommendation.', type: Recommendation })
  @ApiResponse({ status: 404, description: 'Recommendation not found.' })
  findOne(@Param('id') id: string): Promise<Recommendation> {
    return this.recommendationsService.findOne(id);
  }

  @Patch(':id/select')
  @ApiOperation({ summary: 'Mark a recommendation as selected by the student' })
  @ApiParam({ name: 'id', description: 'Recommendation ID' })
  @ApiResponse({ status: 200, description: 'The recommendation has been marked as selected.', type: Recommendation })
  @ApiResponse({ status: 404, description: 'Recommendation not found.' })
  markAsSelected(@Param('id') id: string): Promise<Recommendation> {
    return this.recommendationsService.markAsSelected(id);
  }

  @Post('generate')
  @ApiOperation({ summary: 'Generate new recommendations for a student' })
  @ApiResponse({ status: 201, description: 'New recommendations have been generated.', type: [Recommendation] })
  generate(@Body() generateRecommendationsDto: GenerateRecommendationsDto): Promise<Recommendation[]> {
    return this.recommendationsService.generateRecommendations(generateRecommendationsDto);
  }
}