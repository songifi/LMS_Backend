import { Controller, Post, Body, Get, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { MfaAdminService } from './mfa-admin.service';
import { MfaConfigDto } from '../dto/mfa-config.dto';

@Controller('admin/mfa')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('admin')
export class MfaAdminController {
  constructor(private readonly mfaAdminService: MfaAdminService) {}

  @Get('config')
  async getConfig(): Promise<any> {
    return this.mfaAdminService.getConfig();
  }

  @Post('config')
  async updateConfig(@Body() configDto: MfaConfigDto): Promise<any> {
    return this.mfaAdminService.updateConfig(configDto);
  }

  @Get('stats')
  async getMfaStats(): Promise<any> {
    return this.mfaAdminService.getMfaStats();
  }
}