import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  Query, 
  UseGuards, 
  Req, 
  HttpStatus, 
  HttpException 
} from '@nestjs/common';
import { DashboardService } from '../services/dashboard.service';
import { CreateDashboardDto } from '../dto/create-dashboard.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

@Controller('dashboards')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  async findAll(
    @Query('role') roleId: string,
    @Query('includeTemplates') includeTemplates: boolean,
    @Req() req
  ) {
    return this.dashboardService.findAll(req.user.id, roleId, includeTemplates);
  }

  @Get('templates')
  async getTemplates(@Query('role') roleId: string) {
    return this.dashboardService.getTemplates(roleId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req) {
    const dashboard = await this.dashboardService.findOne(id);
    
    // Check if the user has access to this dashboard
    if (!dashboard.isPublic && dashboard.userId !== req.user.id && 
        (!req.user.roles.includes('admin') && dashboard.roleId && !req.user.roles.includes(dashboard.roleId))) {
      throw new HttpException('You do not have access to this dashboard', HttpStatus.FORBIDDEN);
    }
    
    // Update last accessed timestamp
    this.dashboardService.updateLastAccessed(id);
    
    return dashboard;
  }

  @Post()
  @Roles('admin', 'analyst', 'instructor')
  async create(@Body() createDashboardDto: CreateDashboardDto, @Req() req) {
    return this.dashboardService.create(createDashboardDto, req.user.id);
  }

  @Post('from-template/:templateId')
  @Roles('admin', 'analyst', 'instructor')
  async createFromTemplate(
    @Param('templateId') templateId: string,
    @Body() customizations: any,
    @Req() req
  ) {
    return this.dashboardService.createFromTemplate(templateId, customizations, req.user.id);
  }

  @Put(':id')
  @Roles('admin', 'analyst', 'instructor')
  async update(
    @Param('id') id: string,
    @Body() updateDashboardDto: any,
    @Req() req
  ) {
    const dashboard = await this.dashboardService.findOne(id);
    
    // Check if the user has permission to update this dashboard
    if (dashboard.userId !== req.user.id && !req.user.roles.includes('admin')) {
      throw new HttpException('You do not have permission to update this dashboard', HttpStatus.FORBIDDEN);
    }
    
    return this.dashboardService.update(id, updateDashboardDto);
  }

  @Delete(':id')
  @Roles('admin', 'analyst', 'instructor')
  async remove(@Param('id') id: string, @Req() req) {
    const dashboard = await this.dashboardService.findOne(id);
    
    // Check if the user has permission to delete this dashboard
    if (dashboard.userId !== req.user.id && !req.user.roles.includes('admin')) {
      throw new HttpException('You do not have permission to delete this dashboard', HttpStatus.FORBIDDEN);
    }
    
    return this.dashboardService.remove(id);
  }

  @Post(':id/widgets')
  @Roles('admin', 'analyst', 'instructor')
  async addWidget(
    @Param('id') dashboardId: string,
    @Body() widgetData: any,
    @Req() req
  ) {
    const dashboard = await this.dashboardService.findOne(dashboardId);
    
    // Check if the user has permission to update this dashboard
    if (dashboard.userId !== req.user.id && !req.user.roles.includes('admin')) {
      throw new HttpException('You do not have permission to modify this dashboard', HttpStatus.FORBIDDEN);
    }
    
    return this.dashboardService.addWidget(dashboardId, widgetData);
  }

  @Put(':id/widgets/:widgetId')
  @Roles('admin', 'analyst', 'instructor')
  async updateWidget(
    @Param('id') dashboardId: string,
    @Param('widgetId') widgetId: string,
    @Body() widgetData: any,
    @Req() req
  ) {
    const dashboard = await this.dashboardService.findOne(dashboardId);
    
    // Check if the user has permission to update this dashboard
    if (dashboard.userId !== req.user.id && !req.user.roles.includes('admin')) {
      throw new HttpException('You do not have permission to modify this dashboard', HttpStatus.FORBIDDEN);
    }
    
    return this.dashboardService.updateWidget(dashboardId, widgetId, widgetData);
  }

  @Delete(':id/widgets/:widgetId')
  @Roles('admin', 'analyst', 'instructor')
  async removeWidget(
    @Param('id') dashboardId: string,
    @Param('widgetId') widgetId: string,
    @Req() req
  ) {
    const dashboard = await this.dashboardService.findOne(dashboardId);
    
    // Check if the user has permission to update this dashboard
    if (dashboard.userId !== req.user.id && !req.user.roles.includes('admin')) {
      throw new HttpException('You do not have permission to modify this dashboard', HttpStatus.FORBIDDEN);
    }
    
    return this.dashboardService.removeWidget(dashboardId, widgetId);
  }

  @Post(':id/clone')
  @Roles('admin', 'analyst', 'instructor')
  async cloneDashboard(@Param('id') id: string, @Req() req) {
    return this.dashboardService.clone(id, req.user.id);
  }

  @Post(':id/share')
  @Roles('admin', 'analyst', 'instructor')
  async shareDashboard(
    @Param('id') id: string,
    @Body() shareOptions: { isPublic: boolean; roleId?: string },
    @Req() req
  ) {
    const dashboard = await this.dashboardService.findOne(id);
    
    // Check if the user has permission to share this dashboard
    if (dashboard.userId !== req.user.id && !req.user.roles.includes('admin')) {
      throw new HttpException('You do not have permission to share this dashboard', HttpStatus.FORBIDDEN);
    }
    
    return this.dashboardService.share(id, shareOptions);
  }
}
