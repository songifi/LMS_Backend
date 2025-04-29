import { Controller, Get, Post, Body, Param, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { CreateResponseDto } from '../dto/create-response.dto';
import { Response } from '../entities/response.entity';
import { Request } from 'express';
import { ResponseService } from '../providers/response.service';
import { Public } from 'src/auth/decorators/public.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@ApiTags('responses')
@Controller('responses')
export class ResponseController {
  constructor(private readonly responseService: ResponseService) {}

  @Public()
  @Post('survey/:surveyId')
  @ApiOperation({ summary: 'Submit a response to a survey' })
  @ApiParam({ name: 'surveyId', description: 'Survey ID' })
  @ApiResponse({ status: 201, description: 'The response has been submitted', type: Response })
  submitResponse(
    @Param('surveyId') surveyId: string,
    @Body() createResponseDto: CreateResponseDto,
    @Req() request: Request,
  ): Promise<Response> {
    // Extract metadata from request
    const metadata = {
      ipAddress: request.ip,
      userAgent: request.headers['user-agent'],
      respondentId: request.user?.id, // If authenticated
    };

    return this.responseService.submitResponse(surveyId, createResponseDto, metadata);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('survey/:surveyId')
  @ApiOperation({ summary: 'Get all responses for a survey' })
  @ApiParam({ name: 'surveyId', description: 'Survey ID' })
  @ApiResponse({ status: 200, description: 'Return all responses for the survey', type: [Response] })
  getResponsesForSurvey(@Param('surveyId') surveyId: string): Promise<Response[]> {
    return this.responseService.getResponsesForSurvey(surveyId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('survey/:surveyId/count')
  @ApiOperation({ summary: 'Get response count for a survey' })
  @ApiParam({ name: 'surveyId', description: 'Survey ID' })
  @ApiResponse({ status: 200, description: 'Return response count for the survey' })
  getResponseCount(@Param('surveyId') surveyId: string): Promise<{ count: number }> {
    return this.responseService.getResponseCount(surveyId).then(count => ({ count }));
  }
}