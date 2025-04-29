import { Controller, Get, Post, Body, Param } from "@nestjs/common"
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from "@nestjs/swagger"
import type { CreateEnrollmentApprovalDto } from "../dto/create-enrollment-approval.dto"
import { EnrollmentApproval } from "../entities/enrollment-approval.entity"
import { EnrollmentApprovalService } from "../providers/enrollment-approval.service";

@ApiTags("enrollment-approvals")
@Controller("enrollment-approvals")
export class EnrollmentApprovalController {
  constructor(private readonly enrollmentApprovalService: EnrollmentApprovalService) {}

  @Post()
  @ApiOperation({ summary: 'Submit approval request' })
  @ApiResponse({ status: 201, description: 'The approval request has been successfully created.', type: EnrollmentApproval })
  @ApiResponse({ status: 400, description: 'Invalid input data or approval request already exists.' })
  @ApiResponse({ status: 404, description: 'Registration not found.' })
  async create(@Body() createEnrollmentApprovalDto: CreateEnrollmentApprovalDto): Promise<EnrollmentApproval> {
    return this.enrollmentApprovalService.create(createEnrollmentApprovalDto);
  }

  @Get()
  @ApiOperation({ summary: "Get all approval requests" })
  @ApiResponse({ status: 200, description: "Return all approval requests.", type: [EnrollmentApproval] })
  async findAll(): Promise<EnrollmentApproval[]> {
    return this.enrollmentApprovalService.findAll()
  }

  @Get("pending")
  @ApiOperation({ summary: "Get pending approval requests" })
  @ApiResponse({ status: 200, description: "Return pending approval requests.", type: [EnrollmentApproval] })
  async findPending(): Promise<EnrollmentApproval[]> {
    return this.enrollmentApprovalService.findPending()
  }

  @Get('registration/:registrationId')
  @ApiOperation({ summary: 'Get approval requests for a registration' })
  @ApiParam({ name: 'registrationId', description: 'Registration ID' })
  @ApiResponse({ status: 200, description: 'Return approval requests for the registration.', type: [EnrollmentApproval] })
  async findByRegistration(@Param('registrationId') registrationId: string): Promise<EnrollmentApproval[]> {
    return this.enrollmentApprovalService.findByRegistration(registrationId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get approval request by id' })
  @ApiParam({ name: 'id', description: 'Approval request ID' })
  @ApiResponse({ status: 200, description: 'Return the approval request.', type: EnrollmentApproval })
  @ApiResponse({ status: 404, description: 'Approval request not found.' })
  async findOne(@Param('id') id: string): Promise<EnrollmentApproval> {
    return this.enrollmentApprovalService.findOne(id);
  }

  @Post(":id/approve")
  @ApiOperation({ summary: "Approve an approval request" })
  @ApiParam({ name: "id", description: "Approval request ID" })
  @ApiResponse({
    status: 200,
    description: "The approval request has been successfully approved.",
    type: EnrollmentApproval,
  })
  @ApiResponse({ status: 400, description: "Approval request has already been processed." })
  @ApiResponse({ status: 404, description: "Approval request not found." })
  async approve(
    @Param('id') id: string,
    @Body() body: { processedBy: string; comments: string },
  ): Promise<EnrollmentApproval> {
    return this.enrollmentApprovalService.approve(id, body.processedBy, body.comments)
  }

  @Post(":id/reject")
  @ApiOperation({ summary: "Reject an approval request" })
  @ApiParam({ name: "id", description: "Approval request ID" })
  @ApiResponse({
    status: 200,
    description: "The approval request has been successfully rejected.",
    type: EnrollmentApproval,
  })
  @ApiResponse({ status: 400, description: "Approval request has already been processed." })
  @ApiResponse({ status: 404, description: "Approval request not found." })
  async reject(
    @Param('id') id: string,
    @Body() body: { processedBy: string; comments: string },
  ): Promise<EnrollmentApproval> {
    return this.enrollmentApprovalService.reject(id, body.processedBy, body.comments)
  }
}
