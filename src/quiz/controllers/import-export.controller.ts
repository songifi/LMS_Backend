import { Controller, Get, Post, Query, Body, Param, UseInterceptors, UploadedFile, Res } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { ImportExportService } from '../services/import-export.service';

@Controller('import-export')
export class ImportExportController {
  constructor(private readonly importExportService: ImportExportService) {}

  @Post('import/qti')
  @UseInterceptors(FileInterceptor('file'))
  importQti(@UploadedFile() file: Express.Multer.File) {
    return this.importExportService.importQti(file.buffer);
  }

  @Get('export/qti')
  async exportQti(
    @Query('questionIds') questionIds: string,
    @Query('assessmentId') assessmentId: string,
    @Res() response: Response,
  ) {
    const qtiXml = await this.importExportService.exportQti(
      questionIds ? questionIds.split(',') : [],
      assessmentId,
    );
    
    response.setHeader('Content-Type', 'application/xml');
    response.setHeader('Content-Disposition', 'attachment; filename=export.xml');
    response.send(qtiXml);
  }

  @Post('import/csv')
  @UseInterceptors(FileInterceptor('file'))
  importCsv(@UploadedFile() file: Express.Multer.File) {
    return this.importExportService.importCsv(file.buffer);
  }

  @Get('export/csv')
  async exportCsv(
    @Query('questionIds') questionIds: string,
    @Res() response: Response,
  ) {
    const csvData = await this.importExportService.exportCsv(
      questionIds ? questionIds.split(',') : [],
    );
    
    response.setHeader('Content-Type', 'text/csv');
    response.setHeader('Content-Disposition', 'attachment; filename=questions.csv');
    response.send(csvData);
  }

  @Post('import/json')
  importJson(@Body() data: any) {
    return this.importExportService.importJson(data);
  }

  @Get('export/json')
  exportJson(@Query('questionIds') questionIds: string, @Query('assessmentId') assessmentId: string) {
    return this.importExportService.exportJson(
      questionIds ? questionIds.split(',') : [],
      assessmentId,
    );
  }

  @Get('templates')
  getImportTemplates() {
    return this.importExportService.getImportTemplates();
  }
}