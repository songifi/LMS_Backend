import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { Request } from 'express';
import { LtiGradeService } from '../services/lti-grade-service.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { ScoreDto, SubmitScoreDto } from '../dto/lti-grade.dto';

@Controller('lti/grades')
export class LtiGradeServiceController {
  constructor(private readonly ltiGradeService: LtiGradeService) {}

  /**
   * Get all line items for a context
   */
  @Get('line-items')
  @UseGuards(JwtAuthGuard)
  async getLineItems(
    @Query('contextId') contextId: string,
    @Query('resourceLinkId') resourceLinkId?: string,
    @Query('limit') limit?: number,
    @Query('page') page?: number,
  ) {
    if (!contextId) {
      throw new BadRequestException('Context ID is required');
    }

    return this.ltiGradeService.getLineItems(contextId, resourceLinkId, { limit, page });
  }

  /**
   * Get a specific line item
   */
  @Get('line-items/:id')
  @UseGuards(JwtAuthGuard)
  async getLineItem(@Param('id') id: string) {
    const lineItem = await this.ltiGradeService.getLineItem(id);
    if (!lineItem) {
      throw new NotFoundException('Line item not found');
    }
    return lineItem;
  }

  /**
   * Get scores for a line item
   */
  @Get('line-items/:id/scores')
  @UseGuards(JwtAuthGuard)
  async getScores(
    @Param('id') lineItemId: string,
    @Query('userId') userId?: string,
    @Query('limit') limit?: number,
    @Query('page') page?: number,
  ) {
    return this.ltiGradeService.getScores(lineItemId, userId, { limit, page });
  }

  /**
   * Submit a score for a resource link
   */
  @Post('submit-score')
  @UseGuards(JwtAuthGuard)
  async submitScore(
    @Body() submitScoreDto: SubmitScoreDto,
    @Req() req: Request,
  ) {
    const ltiSessionId = req.user['ltiSessionId'];
    const ltiUserId = req.user['userId'];

    // Only allow submitting scores if the user is authorized
    // In a real implementation, check for instructor/admin role
    if (!ltiUserId) {
      throw new ForbiddenException('Not authorized to submit scores');
    }

    // Convert to a proper score object
    const scoreDto: ScoreDto = {
      userId: submitScoreDto.userId,
      scoreGiven: submitScoreDto.score,
      scoreMaximum: 100, // Should be retrieved from the line item
      comment: submitScoreDto.comment,
      activityProgress: submitScoreDto.activityProgress || 'Completed',
      gradingProgress: submitScoreDto.gradingProgress || 'FullyGraded',
    };

    // Submit the score to the platform
    return this.ltiGradeService.submitScore(
      submitScoreDto.resourceLinkId,
      scoreDto,
      ltiSessionId,
    );
  }

  /**
   * Submit a score directly to a platform line item
   * This is for internal use when we have the line item URL
   */
  @Post('line-items/:id/scores')
  @UseGuards(JwtAuthGuard)
  async submitScoreToLineItem(
    @Param('id') lineItemId: string,
    @Body() scoreDto: ScoreDto,
    @Req() req: Request,
  ) {
    const ltiSessionId = req.user['ltiSessionId'];
    const ltiUserId = req.user['userId'];

    // Only allow submitting scores if the user is authorized
    // In a real implementation, check for instructor/admin role
    if (!ltiUserId) {
      throw new ForbiddenException('Not authorized to submit scores');
    }

    // Submit the score to the platform
    return this.ltiGradeService.submitScoreToLineItem(
      lineItemId,
      scoreDto,
      ltiSessionId,
    );
  }
}