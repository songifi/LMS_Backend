import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CreateCertificateDto } from './dto/create-certificate.dto';
import { CertificateService } from './certificate.service';

@ApiTags('Certificates')
@Controller('certificates')
export class CertificateController {
  constructor(private readonly certificateService: CertificateService) {}

  @Post()
  @ApiOperation({ summary: 'Issue new certificate' })
  create(@Body() dto: CreateCertificateDto) {
    return this.certificateService.issueCertificate(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all certificates' })
  findAll() {
    return this.certificateService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get certificate details' })
  findOne(@Param('id') id: string) {
    return this.certificateService.findById(id);
  }

  @Get(':id/verify')
  @ApiOperation({ summary: 'Verify certificate' })
  verify(@Param('id') id: string) {
    return this.certificateService.verify(id);
  }
}