import { 
    Controller, 
    Get, 
    Post, 
    Body, 
    Patch, 
    Param, 
    Delete, 
    Query, 
    HttpStatus, 
    HttpCode,
    ParseUUIDPipe
  } from '@nestjs/common';
  import { ApplicationCommunicationService } from './application-communication.service';
  import { CreateCommunicationDto } from './dto/create-communication.dto';
  import { UpdateCommunicationDto } from './dto/update-communication.dto';
  import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { ApplicationCommunication, CommunicationStatus, CommunicationType } from './entities/application-communication.entity';
  
  @ApiTags('application-communications')
  @Controller('application-communications')
  export class ApplicationCommunicationController {
    constructor(private readonly communicationService: ApplicationCommunicationService) {}
  
    @Post()
    @ApiOperation({ summary: 'Create a new communication' })
    @ApiResponse({ status: HttpStatus.CREATED, description: 'The communication has been successfully created.' })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input data.' })
    async create(@Body() createDto: CreateCommunicationDto): Promise<ApplicationCommunication> {
      return this.communicationService.create(createDto);
    }
  
    @Get()
    @ApiOperation({ summary: 'Get all communications or filter by type/status' })
    @ApiQuery({ name: 'type', enum: CommunicationType, required: false })
    @ApiQuery({ name: 'status', enum: CommunicationStatus, required: false })
    @ApiQuery({ name: 'applicationId', required: false })
    @ApiResponse({ status: HttpStatus.OK, description: 'Return all communications.' })
    async findAll(
      @Query('type') type?: CommunicationType,
      @Query('status') status?: CommunicationStatus,
      @Query('applicationId') applicationId?: string,
    ): Promise<ApplicationCommunication[]> {
      if (type) {
        return this.communicationService.findByType(type);
      } 
      
      if (status) {
        return this.communicationService.findByStatus(status);
      }
      
      if (applicationId) {
        return this.communicationService.findByApplication(applicationId);
      }
  
      return this.communicationService.findAll();
    }
  
    @Get('pending')
    @ApiOperation({ summary: 'Get all pending communications' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Return all pending communications.' })
    async findPending(): Promise<ApplicationCommunication[]> {
      return this.communicationService.findPendingCommunications();
    }
  
    @Get(':id')
    @ApiOperation({ summary: 'Get communication by id' })
    @ApiParam({ name: 'id', description: 'Communication ID' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Return the communication.' })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Communication not found.' })
    async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<ApplicationCommunication> {
      return this.communicationService.findOne(id);
    }
  
    @Patch(':id')
    @ApiOperation({ summary: 'Update a communication' })
    @ApiParam({ name: 'id', description: 'Communication ID' })
    @ApiResponse({ status: HttpStatus.OK, description: 'The communication has been successfully updated.' })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Communication not found.' })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input data.' })
    async update(
      @Param('id', ParseUUIDPipe) id: string, 
      @Body() updateDto: UpdateCommunicationDto
    ): Promise<ApplicationCommunication> {
      return this.communicationService.update(id, updateDto);
    }
  
    @Delete(':id')
    @ApiOperation({ summary: 'Delete a communication' })
    @ApiParam({ name: 'id', description: 'Communication ID' })
    @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'The communication has been successfully deleted.' })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Communication not found.' })
    @HttpCode(HttpStatus.NO_CONTENT)
    async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
      return this.communicationService.remove(id);
    }
  
    @Patch(':id/sent')
    @ApiOperation({ summary: 'Mark a communication as sent' })
    @ApiParam({ name: 'id', description: 'Communication ID' })
    @ApiResponse({ status: HttpStatus.OK, description: 'The communication has been marked as sent.' })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Communication not found.' })
    async markAsSent(@Param('id', ParseUUIDPipe) id: string): Promise<ApplicationCommunication> {
      return this.communicationService.markAsSent(id);
    }
  
    @Patch(':id/delivered')
    @ApiOperation({ summary: 'Mark a communication as delivered' })
    @ApiParam({ name: 'id', description: 'Communication ID' })
    @ApiResponse({ status: HttpStatus.OK, description: 'The communication has been marked as delivered.' })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Communication not found.' })
    async markAsDelivered(@Param('id', ParseUUIDPipe) id: string): Promise<ApplicationCommunication> {
      return this.communicationService.markAsDelivered(id);
    }
  
    @Patch(':id/read')
    @ApiOperation({ summary: 'Mark a communication as read' })
    @ApiParam({ name: 'id', description: 'Communication ID' })
    @ApiResponse({ status: HttpStatus.OK, description: 'The communication has been marked as read.' })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Communication not found.' })
    async markAsRead(@Param('id', ParseUUIDPipe) id: string): Promise<ApplicationCommunication> {
      return this.communicationService.markAsRead(id);
    }
  
    @Patch(':id/failed')
    @ApiOperation({ summary: 'Mark a communication as failed' })
    @ApiParam({ name: 'id', description: 'Communication ID' })
    @ApiResponse({ status: HttpStatus.OK, description: 'The communication has been marked as failed.' })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Communication not found.' })
    async markAsFailed(
      @Param('id', ParseUUIDPipe) id: string,
      @Body('errorMessage') errorMessage: string
    ): Promise<ApplicationCommunication> {
      return this.communicationService.markAsFailed(id, errorMessage);
    }
  }