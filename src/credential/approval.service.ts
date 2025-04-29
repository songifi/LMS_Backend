import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IssuanceApproval } from './entities/issuance-approval.entity';
import { CreateIssuanceApprovalDto } from './dto/create-issuance-approval.dto';

@Injectable()
export class ApprovalService {
  constructor(
    @InjectRepository(IssuanceApproval)
    private approvalRepo: Repository<IssuanceApproval>,
  ) {}

  submitApproval(dto: CreateIssuanceApprovalDto) {
    const approval = this.approvalRepo.create(dto);
    return this.approvalRepo.save(approval);
  }
}
