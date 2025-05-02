import { Controller, Get, Post, Body, Param, Query, Patch, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AccessibilityService } from './accessibility.service';
import { CreateAuditDto } from './dto/create-audit.dto';
import { UpdateRemediationTaskDto } from './dto/update-remediation-task.dto';
import { RunAutomatedTestDto } from './dto/run-automated-test.dto';
import { CreateManualAuditDto } from './dto/create-manual-audit.dto';
import { GenerateReportDto } from './dto/generate-report.dto';

@ApiTags('accessibility')
@Controller('accessibility')
export class AccessibilityController {
  constructor(private readonly accessibilityService: AccessibilityService) {}

  @Post('automated-test')
  @ApiOperation({ summary: 'Run automated accessibility tests' })
  async runAutomatedTest(@Body() runAutomatedTestDto: RunAutomatedTestDto) {
    return this.accessibilityService.runAutomatedTest(runAutomatedTestDto);
  }

  @Post('manual-audit')
  @ApiOperation({ summary: 'Create a manual accessibility audit' })
  async createManualAudit(@Body() createManualAuditDto: CreateManualAuditDto) {
    return this.accessibilityService.createManualAudit(createManualAuditDto);
  }

  @Get('issues')
  @ApiOperation({ summary: 'Get all accessibility issues' })
  async findAllIssues(@Query('status') status?: string, @Query('priority') priority?: string) {
    return this.accessibilityService.findAllIssues(status, priority);
  }

  @Get('issues/:id')
  @ApiOperation({ summary: 'Get a specific accessibility issue' })
  async findIssueById(@Param('id') id: string) {
    return this.accessibilityService.findIssueById(id);
  }

  @Post('remediation-tasks')
  @ApiOperation({ summary: 'Create a remediation task' })
  async createRemediationTask(@Body() issueId: string) {
    return this.accessibilityService.createRemediationTask(issueId);
  }

  @Patch('remediation-tasks/:id')
  @ApiOperation({ summary: 'Update a remediation task' })
  async updateRemediationTask(
    @Param('id') id: string,
    @Body() updateRemediationTaskDto: UpdateRemediationTaskDto,
  ) {
    return this.accessibilityService.updateRemediationTask(id, updateRemediationTaskDto);
  }

  @Post('reports')
  @ApiOperation({ summary: 'Generate an accessibility compliance report' })
  async generateReport(@Body() generateReportDto: GenerateReportDto) {
    return this.accessibilityService.generateReport(generateReportDto);
  }

  @Get('reports')
  @ApiOperation({ summary: 'Get all accessibility reports' })
  async findAllReports() {
    return this.accessibilityService.findAllReports();
  }

  @Get('reports/:id')
  @ApiOperation({ summary: 'Get a specific accessibility report' })
  async findReportById(@Param('id') id: string) {
    return this.accessibilityService.findReportById(id);
  }
}