import { Controller, Post, HttpStatus, HttpException, Logger } from '@nestjs/common';
import { ScannerService } from '../services/scanner.service';

@Controller('security/scanner')
export class ScannerController {
  private readonly logger = new Logger(ScannerController.name);

  constructor(private readonly scannerService: ScannerService) {}

  @Post('dependency-scan')
  async runDependencyScan() {
    try {
      await this.scannerService.runDependencyScan();
      return { message: 'Dependency vulnerability scan completed successfully' };
    } catch (error) {
      this.logger.error(`Error running dependency scan: ${error.message}`);
      throw new HttpException('Failed to run dependency scan', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('static-analysis')
  async runStaticCodeAnalysis() {
    try {
      await this.scannerService.runStaticCodeAnalysis();
      return { message: 'Static code analysis completed successfully' };
    } catch (error) {
      this.logger.error(`Error running static code analysis: ${error.message}`);
      throw new HttpException('Failed to run static code analysis', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('dynamic-scan')
  async runDynamicScan() {
    try {
      await this.scannerService.runDynamicScan();
      return { message: 'Dynamic application security test completed successfully' };
    } catch (error) {
      this.logger.error(`Error running dynamic scan: ${error.message}`);
      throw new HttpException('Failed to run dynamic scan', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}