@Controller('privacy/retention-policies')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class RetentionPolicyController {
  constructor(private readonly retentionPolicyService: RetentionPolicyService) {}

  @Post()
  @Roles('admin', 'data-officer')
  create(@Body() dto: CreateRetentionPolicyDto) {
    return this.retentionPolicyService.create(dto);
  }

  @Get()
  @Roles('admin', 'data-officer', 'auditor')
  findAll() {
    return this.retentionPolicyService.findAll();
  }

  @Get(':id')
  @Roles('admin', 'data-officer', 'auditor')
  findOne(@Param('id') id: string) {
    return this.retentionPolicyService.findOne(id);
  }

  @Get('entity/:name')
  @Roles('admin', 'data-officer', 'auditor')
  findByEntityName(@Param('name') name: string) {
    return this.retentionPolicyService.findByEntityName(name);
  }

  @Patch(':id')
  @Roles('admin', 'data-officer')
  update(@Param('id') id: string, @Body() dto: Partial<CreateRetentionPolicyDto>) {
    return this.retentionPolicyService.update(id, dto);
  }

  @Patch(':id/activate')
  @Roles('admin', 'data-officer')
  activate(@Param('id') id: string) {
    return this.retentionPolicyService.activate(id);
  }

  @Patch(':id/deactivate')
  @Roles('admin', 'data-officer')
  deactivate(@Param('id') id: string) {
    return this.retentionPolicyService.deactivate(id);
  }

  @Delete(':id')
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.retentionPolicyService.remove(id);
  }
}