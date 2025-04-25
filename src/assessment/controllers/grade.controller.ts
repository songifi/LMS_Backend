import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { CreateGradeDto } from '../dto/create-grade.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { GradeService } from '../providers/grade.service';

@Controller('assessments')
@UseGuards(JwtAuthGuard)
export class GradeController {
  constructor(private readonly gradeService: GradeService) {}

  @Post(':id/grades')
  create(
    @Param('id') id: string,
    @Body() createGradeDto: CreateGradeDto,
    @Request() req,
  ) {
    return this.gradeService.create(createGradeDto, req.user);
  }

  @Get('submissions/:submissionId/grade')
  findBySubmission(@Param('submissionId') submissionId: string) {
    return this.gradeService.findBySubmission(submissionId);
  }
}