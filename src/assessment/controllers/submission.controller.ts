import { Controller, Get, Post, Body, Param, UseGuards, Request, Headers } from '@nestjs/common';
import { CreateSubmissionDto } from '../dto/create-submission.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { SubmissionService } from '../providers/submission.service';

@Controller('assessments')
@UseGuards(JwtAuthGuard)
export class SubmissionController {
  constructor(private readonly submissionService: SubmissionService) {}

  @Post(':id/submissions')
  create(
    @Param('id') id: string,
    @Body() createSubmissionDto: CreateSubmissionDto,
    @Request() req,
    @Headers() headers,
  ) {
    // Add assessment ID to DTO
    createSubmissionDto.assessmentId = id;
    
    // Extract request metadata for plagiarism detection
    const metadata = {
      ipAddress: req.ip,
      userAgent: headers['user-agent'],
    };
    
    return this.submissionService.create(createSubmissionDto, req.user, metadata);
  }

  @Get(':id/submissions')
  findAll(@Param('id') id: string) {
    return this.submissionService.findByAssessment(id);
  }

  @Get('submissions/:id')
  findOne(@Param('id') id: string) {
    return this.submissionService.findOne(id);
  }
}