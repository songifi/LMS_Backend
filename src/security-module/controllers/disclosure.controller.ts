import { Controller, Get, Post, Put, Param, Body, HttpStatus, HttpException, Logger } from '@nestjs/common';
import { DisclosureService } from '../services/disclosure.service';
import { DisclosureSubmission, DisclosureStatus } from '../entities/disclosure-submission.entity';

@Controller('security/disclosure')
export class DisclosureController {
  private readonly logger = new Logger(DisclosureController.name);

  constructor(private readonly disclosureService: DisclosureService) {}

  @Get()
  async getAllDisclosures() {
    try {
      return await this.disclosureService.getAllDisclosures();
    } catch (error) {
      this.logger.error(`Error fetching all disclosures: ${error.message}`);
      throw new HttpException('Failed to retrieve disclosure submissions', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('pending')
  async getPendingDisclosures() {
    try {
      return await this.disclosureService.getPendingDisclosures();
    } catch (error) {
      this.logger.error(`Error fetching pending disclosures: ${error.message}`);
      throw new HttpException('Failed to retrieve pending disclosure submissions', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('policy')
  async getDisclosurePolicy() {
    try {
      return { policy: await this.disclosureService.getResponsibleDisclosurePolicy() };
    } catch (error) {
      this.logger.error(`Error fetching disclosure policy: ${error.message}`);
      throw new HttpException('Failed to retrieve disclosure policy', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id')
  async getDisclosureById(@Param('id') id: string) {
    try {
      return await this.disclosureService.getDisclosureById(id);
    } catch (error) {
      this.logger.error(`Error fetching disclosure ${id}: ${error.message}`);
      throw new HttpException(
        `Disclosure submission not found: ${error.message}`,
        HttpStatus.NOT_FOUND
      );
    }
  }

  @Post()
  async submitDisclosure(@Body() disclosureData: Partial<DisclosureSubmission>) {
    try {
      return await this.disclosureService.submitDisclosure(disclosureData);
    } catch (error) {
      this.logger.error(`Error submitting disclosure: ${error.message}`);
      throw new HttpException(
        `Failed to submit disclosure: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Put(':id/review')
  async reviewDisclosure(
    @Param('id') id: string,
    @Body() reviewData: {
      status: DisclosureStatus;
      reviewedBy: string;
      reviewNotes?: string;
      securityIssueId?: string;
      confirmedDuplicate?: boolean;
      eligibleForBounty?: boolean;
      bountyAmount?: number;
    }
  ) {
    try {
      return await this.disclosureService.reviewDisclosure(id, reviewData);
    } catch (error) {
      this.logger.error(`Error reviewing disclosure ${id}: ${error.message}`);
      throw new HttpException(
        `Failed to review disclosure: ${error.message}`,
        error.message.includes('not found') ? HttpStatus.NOT_FOUND : HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Put(':id/fixed')
  async markAsFixed(
    @Param('id') id: string,
    @Body() fixData: {
      reviewedBy: string;
      publishedUrl?: string;
    }
  ) {
    try {
      return await this.disclosureService.markAsFixed(id, fixData);
    } catch (error) {
      this.logger.error(`Error marking disclosure ${id} as fixed: ${error.message}`);
      throw new HttpException(
        `Failed to mark disclosure as fixed: ${error.message}`,
        error.message.includes('not found') ? HttpStatus.NOT_FOUND : HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Put(':id/publish')
  async publishDisclosure(
    @Param('id') id: string,
    @Body() publishData: {
      reviewedBy: string;
      publishedUrl: string;
    }
  ) {
    try {
      return await this.disclosureService.publishDisclosure(id, publishData);
    } catch (error) {
      this.logger.error(`Error publishing disclosure ${id}: ${error.message}`);
      throw new HttpException(
        `Failed to publish disclosure: ${error.message}`,
        error.message.includes('not found') ? HttpStatus.NOT_FOUND : HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
