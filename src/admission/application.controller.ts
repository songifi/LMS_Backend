import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request, UnauthorizedException, BadRequestException, NotFoundException, HttpStatus, HttpCode } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RolesGuard } from 'src/auth/guards/role.guard';
import { ApplicationService } from './applications.service';
import { StatusType } from './entities/application-status.entity';
import { Application, ApplicationDecision } from './entities/application.entity';

@ApiTags('applications')
@Controller('applications')
export class ApplicationController {
  constructor(private readonly applicationService: ApplicationService) {}

  @Get()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'reviewer')
  @ApiOperation({ summary: 'Get all applications' })
  @ApiQuery({ name: 'programId', required: false })
  @ApiQuery({ name: 'status', required: false, enum: StatusType })
  @ApiQuery({ name: 'decision', required: false, enum: ApplicationDecision })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiBearerAuth()
  async findAll(
    @Query('programId') programId?: string,
    @Query('status') status?: StatusType,
    @Query('decision') decision?: ApplicationDecision,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.applicationService.findAll({
      programId,
      status,
      decision,
      page: Number(page),
      limit: Number(limit),
    });
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Get application by ID' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiBearerAuth()
  async findOne(@Param('id') id: string, @Request() req) {
    const application = await this.applicationService.findOne(id);
    
    if (!application) {
      throw new NotFoundException('Application not found');
    }
    
    // Check if user is authorized to view this application
    if (req.user.roles.includes('admin') || req.user.roles.includes('reviewer') || 
        application.applicantId === req.user.id) {
      return application;
    }
    
    throw new UnauthorizedException('You are not authorized to view this application');
  }

  @Get('public/:token')
  @ApiOperation({ summary: 'Get application by public access token' })
  @ApiParam({ name: 'token', type: 'string' })
  async findByPublicToken(@Param('token') token: string) {
    const application = await this.applicationService.findByPublicToken(token);
    
    if (!application) {
      throw new NotFoundException('Application not found');
    }
    
    return application;
  }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Create a new application' })
  @ApiBearerAuth()
  async create(@Body() applicationData: Partial<Application>, @Request() req) {
    // Set applicant ID from authenticated user
    applicationData.applicantId = req.user.id;
    
    return this.applicationService.create(applicationData);
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Update an application' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiBearerAuth()
  async update(
    @Param('id') id: string,
    @Body() applicationData: Partial<Application>,
    @Request() req,
  ) {
    const application = await this.applicationService.findOne(id);
    
    if (!application) {
      throw new NotFoundException('Application not found');
    }
    
    // Check if user is authorized to update this application
    if (req.user.roles.includes('admin') || application.applicantId === req.user.id) {
      return this.applicationService.update(id, applicationData);
    }
    
    throw new UnauthorizedException('You are not authorized to update this application');
  }

  @Post(':id/submit')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Submit an application' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiBearerAuth()
  async submit(@Param('id') id: string, @Request() req) {
    const application = await this.applicationService.findOne(id);
    
    if (!application) {
      throw new NotFoundException('Application not found');
    }
    
    // Check if user is authorized to submit this application
    if (req.user.roles.includes('admin') || application.applicantId === req.user.id) {
      if (application.isSubmitted) {
        throw new BadRequestException('Application is already submitted');
      }
      
      return this.applicationService.submit(id);
    }
    
    throw new UnauthorizedException('You are not authorized to submit this application');
  }

  @Post(':id/decision')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Make a decision on an application' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiBearerAuth()
  async makeDecision(
    @Param('id') id: string,
    @Body() decisionData: { decision: ApplicationDecision; notes?: string },
    @Request() req,
  ) {
    const application = await this.applicationService.findOne(id);
    
    if (!application) {
      throw new NotFoundException('Application not found');
    }
    
    return this.applicationService.makeDecision(id, decisionData.decision, req.user.id, decisionData.notes);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Delete an application' })
  @ApiParam({ name: 'id', type: 'string' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  async remove(@Param('id') id: string, @Request() req) {
    const application = await this.applicationService.findOne(id);
    
    if (!application) {
      throw new NotFoundException('Application not found');
    }
    
    // Check if user is authorized to delete this application
    if (req.user.roles.includes('admin') || application.applicantId === req.user.id) {
      await this.applicationService.remove(id);
      return;
    }
    
    throw new UnauthorizedException('You are not authorized to delete this application');
  }

  @Get(':id/documents')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Get application documents' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiBearerAuth()
  async getDocuments(@Param('id') id: string, @Request() req) {
    const application = await this.applicationService.findOne(id);
    
    if (!application) {
      throw new NotFoundException('Application not found');
    }
    
    // Check if user is authorized to view this application's documents
    if (req.user.roles.includes('admin') || req.user.roles.includes('reviewer') || 
        application.applicantId === req.user.id) {
      return this.applicationService.getDocuments(id);
    }
    
    throw new UnauthorizedException('You are not authorized to view these documents');
  }

  @Get(':id/reviews')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Get application reviews' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiBearerAuth()
  async getReviews(@Param('id') id: string, @Request() req) {
    const application = await this.applicationService.findOne(id);
    
    if (!application) {
      throw new NotFoundException('Application not found');
    }
    
    // Check if user is authorized to view this application's reviews
    if (req.user.roles.includes('admin') || req.user.roles.includes('reviewer')) {
      return this.applicationService.getReviews(id);
    }
    
    throw new UnauthorizedException('You are not authorized to view these reviews');
  }

  @Get(':id/status-history')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Get application status history' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiBearerAuth()
  async getStatusHistory(@Param('id') id: string, @Request() req) {
    const application = await this.applicationService.findOne(id);
    
    if (!application) {
      throw new NotFoundException('Application not found');
    }
    
    // Check if user is authorized to view this application's status history
    if (req.user.roles.includes('admin') || req.user.roles.includes('reviewer') || 
        application.applicantId === req.user.id) {
      return this.applicationService.getStatusHistory(id);
    }
    
    throw new UnauthorizedException('You are not authorized to view this status history');
  }

  @Get(':id/fees')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Get application fees' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiBearerAuth()
  async getFees(@Param('id') id: string, @Request() req) {
    const application = await this.applicationService.findOne(id);
    
    if (!application) {
      throw new NotFoundException('Application not found');
    }
    
    // Check if user is authorized to view this application's fees
    if (req.user.roles.includes('admin') || application.applicantId === req.user.id) {
      return this.applicationService.getFees(id);
    }
    
    throw new UnauthorizedException('You are not authorized to view these fees');
  }

  @Get(':id/communications')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Get application communications' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiBearerAuth()
  async getCommunications(@Param('id') id: string, @Request() req) {
    const application = await this.applicationService.findOne(id);
    
    if (!application) {
      throw new NotFoundException('Application not found');
    }
    
    // Check if user is authorized to view this application's communications
    if (req.user.roles.includes('admin') || application.applicantId === req.user.id) {
      return this.applicationService.getCommunications(id);
    }
    
    throw new UnauthorizedException('You are not authorized to view these communications');
  }

  @Post(':id/generate-public-token')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Generate a public access token for an application' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiBearerAuth()
  async generatePublicToken(@Param('id') id: string, @Request() req) {
    const application = await this.applicationService.findOne(id);
    
    if (!application) {
      throw new NotFoundException('Application not found');
    }
    
    // Check if user is authorized to generate a public token for this application
    if (req.user.roles.includes('admin') || application.applicantId === req.user.id) {
      return this.applicationService.generatePublicToken(id);
    }
    
    throw new UnauthorizedException('You are not authorized to generate a public token for this application');
  }
}