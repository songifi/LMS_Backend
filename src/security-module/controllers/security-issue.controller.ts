import { Controller, Get, Post, Put, Param, Body, Query, HttpStatus, HttpException, Logger } from '@nestjs/common';
import { SecurityIssueService } from '../services/scanner.service';
import { SecurityIssue, IssueStatus, IssueSeverity } from '../entities/security-issue.entity';

@Controller('security/issues')
export class SecurityIssueController {
  private readonly logger = new Logger(SecurityIssueController.name);

  constructor(private readonly securityIssueService: SecurityIssueService) {}

  @Get()
  async getAllIssues() {
    try {
      return await this.securityIssueService.getAllIssues();
    } catch (error) {
      this.logger.error(`Error fetching all security issues: ${error.message}`);
      throw new HttpException('Failed to retrieve security issues', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('summary')
  async getIssueSummary() {
    try {
      return await this.securityIssueService.getIssueSummary();
    } catch (error) {
      this.logger.error(`Error fetching security issue summary: ${error.message}`);
      throw new HttpException('Failed to retrieve issue summary', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('status/:status')
  async getIssuesByStatus(@Param('status') status: IssueStatus) {
    try {
      return await this.securityIssueService.getIssuesByStatus(status);
    } catch (error) {
      this.logger.error(`Error fetching issues by status ${status}: ${error.message}`);
      throw new HttpException(`Failed to retrieve issues with status ${status}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('severity/:severity')
  async getIssuesBySeverity(@Param('severity') severity: IssueSeverity) {
    try {
      return await this.securityIssueService.getIssuesBySeverity(severity);
    } catch (error) {
      this.logger.error(`Error fetching issues by severity ${severity}: ${error.message}`);
      throw new HttpException(`Failed to retrieve issues with severity ${severity}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id')
  async getIssueById(@Param('id') id: string) {
    try {
      return await this.securityIssueService.getIssueById(id);
    } catch (error) {
      this.logger.error(`Error fetching security issue ${id}: ${error.message}`);
      throw new HttpException(
        `Security issue not found: ${error.message}`,
        HttpStatus.NOT_FOUND
      );
    }
  }

  @Post()
  async createIssue(@Body() issueData: Partial<SecurityIssue>) {
    try {
      return await this.securityIssueService.createIssue(issueData);
    } catch (error) {
      this.logger.error(`Error creating security issue: ${error.message}`);
      throw new HttpException(
        `Failed to create security issue: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Put(':id')
  async updateIssue(
    @Param('id') id: string,
    @Body() updateData: Partial<SecurityIssue>
  ) {
    try {
      return await this.securityIssueService.updateIssue(id, updateData);
    } catch (error) {
      this.logger.error(`Error updating security issue ${id}: ${error.message}`);
      throw new HttpException(
        `Failed to update security issue: ${error.message}`,
        error.message.includes('not found') ? HttpStatus.NOT_FOUND : HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Put(':id/assign')
  async assignIssue(
    @Param('id') id: string,
    @Body() assignData: { assignee: string }
  ) {
    try {
      return await this.securityIssueService.assignIssue(id, assignData.assignee);
    } catch (error) {
      this.logger.error(`Error assigning security issue ${id}: ${error.message}`);
      throw new HttpException(
        `Failed to assign security issue: ${error.message}`,
        error.message.includes('not found') ? HttpStatus.NOT_FOUND : HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
