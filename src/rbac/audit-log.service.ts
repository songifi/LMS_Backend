import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, FindOptionsWhere } from 'typeorm';
import { GetAuditLogsDto } from './dto/get-audit-log.dto';

@Injectable()
export class AuditLogService {
  constructor(
    @InjectRepository(AuditLogService)
    private auditLogRepository: Repository<GetAuditLogsDto>,
    private requestContextService: RequestContextService,
  ) {}

  async logAction(
    action: string,
    description: string,
    entityType: string,
    entityId: string,
    metadata?: Record<string, any>,
  ): Promise<AuditLog> {
    const currentUser = this.requestContextService.getCurrentUser();
    const request = this.requestContextService.getRequest();
    
    const auditLog = this.auditLogRepository.create({
      action,
      description,
      entityType,
      entityId,
      metadata,
      userId: currentUser?.id,
      userAgent: request?.headers['user-agent'],
      ipAddress: request?.ip,
    });

    return this.auditLogRepository.save(auditLog);
  }

  async getLogs(getAuditLogsDto: GetAuditLogsDto) {
    const {
      action,
      userId,
      entityType,
      entityId,
      startDate,
      endDate,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = getAuditLogsDto;

    const where: FindOptionsWhere<AuditLog> = {};

    if (action) {
      where.action = action;
    }

    if (userId) {
      where.userId = userId;
    }

    if (entityType) {
      where.entityType = entityType;
    }

    if (entityId) {
      where.entityId = entityId;
    }

    if (startDate && endDate) {
      where.createdAt = Between(new Date(startDate), new Date(endDate));
    } else if (startDate) {
      where.createdAt = Between(new Date(startDate), new Date());
    } else if (endDate) {
      where.createdAt = Between(new Date(0), new Date(endDate));
    }

    const [logs, total] = await this.auditLogRepository.findAndCount({
      where,
      order: {
        [sortBy]: sortOrder,
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data: logs,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}