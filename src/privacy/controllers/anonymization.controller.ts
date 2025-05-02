@Controller('privacy/anonymization')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class AnonymizationController {
  constructor(private readonly anonymizationService: AnonymizationService) {}

  @Post(':entityName/:recordId')
  @Roles('admin', 'data-officer')
  anonymizeRecord(
    @Param('entityName') entityName: string,
    @Param('recordId') recordId: string,
    @Body() body: { fieldsToAnonymize: string[]; strategy: string; performedBy: string; relatedToRequest?: string }
  ) {
    return this.anonymizationService.anonymizeRecord(
      entityName,
      recordId,
      body.fieldsToAnonymize,
      body.strategy,
      body.performedBy,
      body.relatedToRequest
    );
  }

  @Post('bulk/:entityName')
  @Roles('admin', 'data-officer')
  bulkAnonymize(
    @Param('entityName') entityName: string,
    @Body() body: { condition: string; fieldsToAnonymize: string[]; strategy: string; performedBy: string }
  ) {
    return this.anonymizationService.bulkAnonymize(
      entityName,
      body.condition,
      body.fieldsToAnonymize,
      body.strategy,
      body.performedBy
    );
  }

  @Get('logs')
  @Roles('admin', 'data-officer', 'auditor')
  getLogs(@Body() body: { entityName?: string; recordId?: string }) {
    return this.anonymizationService.getLogs(body.entityName, body.recordId);
  }
}
