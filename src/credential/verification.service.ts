import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VerificationRecord } from './entities/verification-record.entity';
import { CreateVerificationRecordDto } from './dto/create-verification-record.dto';

@Injectable()
export class VerificationService {
  constructor(
    @InjectRepository(VerificationRecord)
    private verificationRepo: Repository<VerificationRecord>,
  ) {}

  verifyCredential(dto: CreateVerificationRecordDto) {
    const record = this.verificationRepo.create(dto);
    return this.verificationRepo.save(record);
  }

  getVerifications() {
    return this.verificationRepo.find();
  }
}
