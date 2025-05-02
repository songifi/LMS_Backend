import { Controller, Post, Body, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { VerificationService } from './verification.service';
import { CreateVerificationRecordDto } from './dto/create-verification-record.dto';

@ApiTags('Verification')
@Controller('verification')
export class VerificationController {
  constructor(private readonly verificationService: VerificationService) {}

  @Post()
  @ApiOperation({ summary: 'Verify credential externally' })
  verify(@Body() dto: CreateVerificationRecordDto) {
    return this.verificationService.verifyCredential(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all verification records' })
  getAll() {
    return this.verificationService.getVerifications();
  }
}
