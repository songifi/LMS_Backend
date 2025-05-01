import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MfaConfigEntity } from '../entities/mfa-config.entity';
import { MfaEntity } from '../entities/mfa.entity';
import { MfaMethod } from '../enums/mfa-method.enum';
import { MfaConfigDto } from '../dto/mfa-config.dto';
import { MfaService } from '../mfa.service';

@Injectable()
export class MfaAdminService {
  constructor(
    @InjectRepository(MfaConfigEntity)
    private mfaConfigRepository: Repository<MfaConfigEntity>,
    @InjectRepository(MfaEntity)
    private mfaRepository: Repository<MfaEntity>,
    private mfaService: MfaService,
  ) {}

  async getConfig(): Promise<MfaConfigEntity> {
    return this.mfaService.getConfig();
  }

  async updateConfig(configDto: MfaConfigDto): Promise<MfaConfigEntity> {
    let config = await this.mfaConfigRepository.findOne({ where: {} });
    
    if (!config) {
      config = await this.mfaService.initializeConfig();
    }
    
    const updatedConfig = {
      ...config,
      ...configDto,
    };
    
    return this.mfaConfigRepository.save(updatedConfig);
  }

  async getMfaStats(): Promise<any> {
    const totalUsers = await this.mfaRepository
      .createQueryBuilder('mfa')
      .select('COUNT(DISTINCT mfa.userId)', 'count')
      .getRawOne();

    const methodStats = await Promise.all(
      Object.values(MfaMethod).map(async (method) => {
        const count = await this.mfaRepository
          .createQueryBuilder('mfa')
          .where('mfa.method = :method AND mfa.isActive = true', { method })
          .getCount();
        
        return { method, count };
      })
    );

    return {
      totalUsersWithMfa: parseInt(totalUsers.count, 10),
      methodBreakdown: methodStats,
    };
  }
}