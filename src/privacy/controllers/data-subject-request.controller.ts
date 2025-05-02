@Controller('privacy/data-subject-requests')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class DataSubjectRequestController {
  constructor(private readonly dataSubjectRequestService: DataSubjectRequestService) {}

  @Post()
  @Roles('user', 'admin', 'data-officer')
  create(@Body() dto: CreateDataSubjectRequestDto) {
    return this.dataSubjectRequestService.create(dto);
  }

  @Get()
  @Roles('admin', 'data-officer', 'auditor')
  findAll() {
    return this.dataSubjectRequestService.findAll();
  }

  @Get(':id')
  @Roles('admin', 'data-officer', 'auditor')
  findOne(@Param('id') id: string) {
    return this.dataSubjectRequestService.findOne(id);
  }

  @Get('status/:status')
  @Roles('admin', 'data-officer', 'auditor')
  findByStatus(@Param('status') status: DataSubjectRequestStatus) {
    return this.dataSubjectRequestService.findByStatus(status);
  }

  @Get('subject/:subjectId')
  @Roles('user', 'admin', 'data-officer', 'auditor')
  findBySubject(@Param('subjectId') subjectId: string) {
    return this.dataSubjectRequestService.findBySubject(subjectId);
  }

  @Patch(':id/status')
  @Roles('admin', 'data-officer')
  updateStatus(
    @Param('id') id: string,
    @Body() body: { status: DataSubjectRequestStatus; performedBy: string; notes?: string }
  ) {
    return this.dataSubjectRequestService.updateStatus(id, body.status, body.performedBy, body.notes);
  }

  @Patch(':id/assign')
  @Roles('admin', 'data-officer')
  assignRequest(
    @Param('id') id: string,
    @Body() body: { assignedTo: string; performedBy: string }
  ) {
    return this.dataSubjectRequestService.assignRequest(id, body.assignedTo, body.performedBy);
  }

  @Patch(':id/verify-identity')
  @Roles('admin', 'data-officer')
  verifyIdentity(
    @Param('id') id: string,
    @Body() body: { performedBy: string; notes?: string }
  ) {
    return this.dataSubjectRequestService.verifyIdentity(id, body.performedBy, body.notes);
  }

  @Patch(':id/add-action')
  @Roles('admin', 'data-officer')
  addActionToHistory(
    @Param('id') id: string,
    @Body() body: { action: string; performedBy: string; notes?: string }
  ) {
    return this.dataSubjectRequestService.addActionToHistory(
      id,
      body.action,
      body.performedBy,
      body.notes
    );
  }

  @Post(':id/process-access')
  @Roles('admin', 'data-officer')
  processAccessRequest(
    @Param('id') id: string,
    @Body() body: { performedBy: string }
  ) {
    return this.dataSubjectRequestService.processAccessRequest(id, body.performedBy);
  }

  @Post(':id/process-erasure')
  @Roles('admin', 'data-officer')
  processErasureRequest(
    @Param('id') id: string,
    @Body() body: { performedBy: string }
  ) {
    return this.dataSubjectRequestService.processErasureRequest(id, body.performedBy);
  }

  @Post(':id/process-rectification')
  @Roles('admin', 'data-officer')
  processRectificationRequest(
    @Param('id') id: string,
    @Body() body: { 
      corrections: Array<{ entityName: string; recordId: string; updates: Record<string, any> }>;
      performedBy: string;
    }
  ) {
    return this.dataSubjectRequestService.processRectificationRequest(
      id,
      body.corrections,
      body.performedBy
    );
  }

  @Patch(':id/complete')
  @Roles('admin', 'data-officer')
  completeRequest(
    @Param('id') id: string,
    @Body() body: { performedBy: string; notes?: string }
  ) {
    return this.dataSubjectRequestService.completeRequest(id, body.performedBy, body.notes);
  }

  @Patch(':id/reject')
  @Roles('admin', 'data-officer')
  rejectRequest(
    @Param('id') id: string,
    @Body() body: { performedBy: string; reason: string }
  ) {
    return this.dataSubjectRequestService.rejectRequest(id, body.performedBy, body.reason);
  }

  @Get('statistics')
  @Roles('admin', 'data-officer', 'auditor')
  getRequestsStatistics(@Body() body: { startDate?: Date; endDate?: Date }) {
    return this.dataSubjectRequestService.getRequestsStatistics(body.startDate, body.endDate);
  }
}
