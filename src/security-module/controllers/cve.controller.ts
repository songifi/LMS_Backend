import { Controller, Get, Post, Put, Param, Body, HttpStatus, HttpException, Logger } from '@nestjs/common';
import { CveService } from '../services/cve.service';
import { CveAlert } from '../entities/cve-alert.entity';

@Controller('security/cve')
export class CveController {
  private readonly logger = new Logger(CveController.name);

  constructor(private readonly cveService: CveService) {}

  @Get('unpatched')
  async getUnpatchedCVEs() {
    try {
      return await this.cveService.getUnpatchedCVEs();
    } catch (error) {
      this.logger.error(`Error fetching unpatched CVEs: ${error.message}`);
      throw new HttpException('Failed to retrieve unpatched CVEs', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('fetch')
  async fetchLatestCVEs() {
    try {
      await this.cveService.fetchLatestCVEs();
      return { message: 'CVE data successfully fetched and processed' };
    } catch (error) {
      this.logger.error(`Error fetching latest CVEs: ${error.message}`);
      throw new HttpException('Failed to fetch latest CVE data', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put(':id/acknowledge')
  async acknowledgeCve(@Param('id') id: string) {
    try {
      return await this.cveService.acknowledgeCAL(id);
    } catch (error) {
      this.logger.error(`Error acknowledging CVE ${id}: ${error.message}`);
      throw new HttpException(
        `Failed to acknowledge CVE: ${error.message}`,
        error.message.includes('not found') ? HttpStatus.NOT_FOUND : HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Put(':id/patched')
  async markCvePatched(
    @Param('id') id: string,
    @Body() patchData: { patchedVersion: string }
  ) {
    try {
      return await this.cveService.markPatched(id, patchData.patchedVersion);
    } catch (error) {
      this.logger.error(`Error marking CVE ${id} as patched: ${error.message}`);
      throw new HttpException(
        `Failed to mark CVE as patched: ${error.message}`,
        error.message.includes('not found') ? HttpStatus.NOT_FOUND : HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}