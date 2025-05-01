import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ApprovalService } from './approval.service';
import { CreateIssuanceApprovalDto } from './dto/create-issuance-approval.dto';

@ApiTags('Approvals')
@Controller('credential-approvals')
export class ApprovalController {
  constructor(private readonly approvalService: ApprovalService) {}

  @Post()
  @ApiOperation({ summary: 'Submit credential approval' })
  create(@Body() dto: CreateIssuanceApprovalDto) {
    return this.approvalService.submitApproval(dto);
  }
}