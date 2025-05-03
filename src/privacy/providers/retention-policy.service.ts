@Injectable()
export class RetentionPolicyService {
  constructor(
    @InjectRepository(RetentionPolicyEntity)
    private retentionPolicyRepository: Repository<RetentionPolicyEntity>,
    private dataInventoryService: DataInventoryService,
  ) {}

  async create(dto: CreateRetentionPolicyDto): Promise<RetentionPolicyEntity> {
    // Verify that the entity exists in data inventory
    const entityExists = await this.dataInventoryService.findByEntityName(dto.entityName);
    if (!entityExists) {
      throw new Error(`Entity ${dto.entityName} not found in data inventory`);
    }

    const retentionPolicy = this.retentionPolicyRepository.create(dto);
    return this.retentionPolicyRepository.save(retentionPolicy);
  }

  async findAll(): Promise<RetentionPolicyEntity[]> {
    return this.retentionPolicyRepository.find();
  }

  async findOne(id: string): Promise<RetentionPolicyEntity> {
    return this.retentionPolicyRepository.findOne({ where: { id } });
  }

  async findByEntityName(entityName: string): Promise<RetentionPolicyEntity[]> {
    return this.retentionPolicyRepository.find({ where: { entityName } });
  }

  async update(id: string, dto: Partial<CreateRetentionPolicyDto>): Promise<RetentionPolicyEntity> {
    await this.retentionPolicyRepository.update(id, dto);
    return this.retentionPolicyRepository.findOne({ where: { id } });
  }

  async activate(id: string): Promise<RetentionPolicyEntity> {
    await this.retentionPolicyRepository.update(id, { isActive: true });
    return this.retentionPolicyRepository.findOne({ where: { id } });
  }

  async deactivate(id: string): Promise<RetentionPolicyEntity> {
    await this.retentionPolicyRepository.update(id, { isActive: false });
    return this.retentionPolicyRepository.findOne({ where: { id } });
  }

  async remove(id: string): Promise<void> {
    await this.retentionPolicyRepository.delete(id);
  }

  // Calculate expiration date based on retention period
  calculateExpirationDate(createdAt: Date, policy: RetentionPolicyEntity): Date {
    const date = new Date(createdAt);
    
    switch (policy.retentionPeriodUnit) {
      case RetentionPeriodUnit.DAYS:
        date.setDate(date.getDate() + policy.retentionPeriod);
        break;
      case RetentionPeriodUnit.MONTHS:
        date.setMonth(date.getMonth() + policy.retentionPeriod);
        break;
      case RetentionPeriodUnit.YEARS:
        date.setFullYear(date.getFullYear() + policy.retentionPeriod);
        break;
      case RetentionPeriodUnit.INDEFINITE:
        // Set to a far future date
        date.setFullYear(9999);
        break;
    }
    
    return date;
  }
}
