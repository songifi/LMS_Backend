import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import type { Repository, DataSource } from "typeorm"
import { TenantEntity, TenantStatus } from "./entities/tenant.entity"
import { TenantConfigEntity } from "./entities/tenant-config.entity"
import { TenantUsageEntity } from "./entities/tenant-usage.entity"
import type { CreateTenantDto } from "./dto/create-tenant.dto"
import type { UpdateTenantDto } from "./dto/update-tenant.dto"

@Injectable()
export class TenantService {
  constructor(
    @InjectRepository(TenantEntity)
    private tenantRepository: Repository<TenantEntity>,
    @InjectRepository(TenantConfigEntity)
    private tenantConfigRepository: Repository<TenantConfigEntity>,
    @InjectRepository(TenantUsageEntity)
    private tenantUsageRepository: Repository<TenantUsageEntity>,
    private dataSource: DataSource,
  ) {}

  async findAll(): Promise<TenantEntity[]> {
    return this.tenantRepository.find({
      relations: ["config", "usage"],
    })
  }

  async findById(id: string): Promise<TenantEntity> {
    const tenant = await this.tenantRepository.findOne({
      where: { id },
      relations: ["config", "usage"],
    })

    if (!tenant) {
      throw new NotFoundException(`Tenant with ID ${id} not found`)
    }

    return tenant
  }

  async findBySlug(slug: string): Promise<TenantEntity> {
    const tenant = await this.tenantRepository.findOne({
      where: { slug },
      relations: ["config", "usage"],
    })

    if (!tenant) {
      throw new NotFoundException(`Tenant with slug ${slug} not found`)
    }

    return tenant
  }

  async create(createTenantDto: CreateTenantDto): Promise<TenantEntity> {
    const queryRunner = this.dataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
      // Create tenant
      const tenant = this.tenantRepository.create({
        name: createTenantDto.name,
        slug: createTenantDto.slug,
        description: createTenantDto.description,
        isEnterprise: createTenantDto.isEnterprise || false,
        status: TenantStatus.PENDING,
      })

      const savedTenant = await queryRunner.manager.save(tenant)

      // Create tenant config
      const config = this.tenantConfigRepository.create({
        tenantId: savedTenant.id,
        settings: createTenantDto.settings || {},
        maxUsers: createTenantDto.maxUsers || 100,
        maxConcurrentSessions: createTenantDto.maxConcurrentSessions || 5,
        storageQuota: createTenantDto.storageQuota || "5GB",
        apiRequestsPerDay: createTenantDto.apiRequestsPerDay || 1000,
        enableAuditLogs: createTenantDto.enableAuditLogs !== undefined ? createTenantDto.enableAuditLogs : true,
        enableAdvancedFeatures: createTenantDto.enableAdvancedFeatures || false,
      })

      await queryRunner.manager.save(config)

      // Create tenant usage
      const usage = this.tenantUsageRepository.create({
        tenantId: savedTenant.id,
      })

      await queryRunner.manager.save(usage)

      // Set up RLS policies for the new tenant
      await queryRunner.query(`
        SELECT setup_tenant_rls('${savedTenant.id}');
      `)

      await queryRunner.commitTransaction()

      return this.findById(savedTenant.id)
    } catch (error) {
      await queryRunner.rollbackTransaction()
      throw new BadRequestException(`Failed to create tenant: ${error.message}`)
    } finally {
      await queryRunner.release()
    }
  }

  async update(id: string, updateTenantDto: UpdateTenantDto): Promise<TenantEntity> {
    const tenant = await this.findById(id)

    // Update tenant entity
    if (updateTenantDto.name) tenant.name = updateTenantDto.name
    if (updateTenantDto.slug) tenant.slug = updateTenantDto.slug
    if (updateTenantDto.description !== undefined) tenant.description = updateTenantDto.description
    if (updateTenantDto.status) tenant.status = updateTenantDto.status
    if (updateTenantDto.isEnterprise !== undefined) tenant.isEnterprise = updateTenantDto.isEnterprise

    // Update tenant config
    if (tenant.config) {
      if (updateTenantDto.settings) tenant.config.settings = { ...tenant.config.settings, ...updateTenantDto.settings }
      if (updateTenantDto.maxUsers) tenant.config.maxUsers = updateTenantDto.maxUsers
      if (updateTenantDto.maxConcurrentSessions)
        tenant.config.maxConcurrentSessions = updateTenantDto.maxConcurrentSessions
      if (updateTenantDto.storageQuota) tenant.config.storageQuota = updateTenantDto.storageQuota
      if (updateTenantDto.apiRequestsPerDay) tenant.config.apiRequestsPerDay = updateTenantDto.apiRequestsPerDay
      if (updateTenantDto.enableAuditLogs !== undefined) tenant.config.enableAuditLogs = updateTenantDto.enableAuditLogs
      if (updateTenantDto.enableAdvancedFeatures !== undefined)
        tenant.config.enableAdvancedFeatures = updateTenantDto.enableAdvancedFeatures
    }

    await this.tenantRepository.save(tenant)
    return this.findById(id)
  }

  async delete(id: string): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
      const tenant = await this.findById(id)

      // Archive tenant instead of hard delete
      tenant.status = TenantStatus.ARCHIVED
      await queryRunner.manager.save(tenant)

      // Disable RLS policies for this tenant
      await queryRunner.query(`
        SELECT disable_tenant_rls('${id}');
      `)

      await queryRunner.commitTransaction()
    } catch (error) {
      await queryRunner.rollbackTransaction()
      throw new BadRequestException(`Failed to delete tenant: ${error.message}`)
    } finally {
      await queryRunner.release()
    }
  }

  async hardDelete(id: string): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
      // Remove RLS policies for this tenant
      await queryRunner.query(`
        SELECT remove_tenant_rls('${id}');
      `)

      // Delete tenant data
      await queryRunner.query(`
        SELECT delete_tenant_data('${id}');
      `)

      // Delete tenant records
      await queryRunner.manager.delete(TenantUsageEntity, { tenantId: id })
      await queryRunner.manager.delete(TenantConfigEntity, { tenantId: id })
      await queryRunner.manager.delete(TenantEntity, { id })

      await queryRunner.commitTransaction()
    } catch (error) {
      await queryRunner.rollbackTransaction()
      throw new BadRequestException(`Failed to hard delete tenant: ${error.message}`)
    } finally {
      await queryRunner.release()
    }
  }
}
