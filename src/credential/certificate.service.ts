import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Certificate } from './entities/certificate.entity';
import { CertificateTemplate } from './entities/certificate-template.entity';
import { CreateCertificateDto } from './dto/create-certificate.dto';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class CertificateService {
  constructor(
    @InjectRepository(Certificate)
    private readonly certificateRepo: Repository<Certificate>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectRepository(CertificateTemplate)
    private readonly templateRepo: Repository<CertificateTemplate>,
  ) {}

  async issueCertificate(dto: CreateCertificateDto): Promise<Certificate> {
    const user = await this.userRepo.findOne({ where: { id: dto.userId } });
    const template = await this.templateRepo.findOne({ where: { id: dto.templateId } });

    if (!user || !template) {
      throw new Error('User or Certificate Template not found');
    }

    const certificate = this.certificateRepo.create({
      user,
      template,
      courseName: dto.courseTitle,
      issuedDate: new Date(),
      hash: this.generateHash(),
    });

    return this.certificateRepo.save(certificate);
  }

  async findAll(): Promise<Certificate[]> {
    return this.certificateRepo.find({ relations: ['user', 'template'] });
  }

  async findById(id: string): Promise<Certificate | null> {
    return this.certificateRepo.findOne({
      where: { id: Number(id) },
      relations: ['user', 'template'],
    });
  }

  async verify(id: string): Promise<{ verified: boolean; certificate?: Certificate }> {
    const cert = await this.certificateRepo.findOne({
      where: { id: Number(id) },
      relations: ['user', 'template'],
    });

    return {
      verified: !!cert,
      certificate: cert || undefined,
    };
  }

  private generateHash(): string {
    return Math.random().toString(36).substring(2, 12);
  }
}
