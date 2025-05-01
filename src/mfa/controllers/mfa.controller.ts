import { Controller, Post, Body, Get, Param, Delete, UseGuards, Req, NotFoundException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { MfaService } from './mfa.service';
import { SetupMfaDto } from './dto/setup-mfa.dto';
import { VerifyMfaDto } from './dto/verify-mfa.dto';
import { VerifyRecoveryCodeDto } from './dto/recovery.dto';
import { MfaMethod } from './enums/mfa-method.enum';

@Controller('mfa')
@UseGuards(AuthGuard('jwt'))
export class MfaController {
  constructor(private readonly mfaService: MfaService) {}

  @Get('status')
  async getMfaStatus(@Req() req): Promise<any> {
    const userId = req.user.id;
    return this.mfaService.getMfaStatusForUser(userId);
  }

  @Post('setup')
  async setupMfa(@Req() req, @Body() setupDto: SetupMfaDto): Promise<any> {
    const userId = req.user.id;
    return this.mfaService.setupMfa(userId, setupDto);
  }

  @Post('verify')
  async verifyMfa(@Req() req, @Body() verifyDto: VerifyMfaDto): Promise<any> {
    const userId = req.user.id;
    const isVerified = await this.mfaService.verifyMfa(userId, verifyDto);
    
    if (!isVerified) {
      throw new NotFoundException('Invalid verification code');
    }
    
    return { success: true };
  }

  @Delete('disable/:method?')
  async disableMfa(@Req() req, @Param('method') method?: MfaMethod): Promise<any> {
    const userId = req.user.id;
    await this.mfaService.disableMfa(userId, method);
    return { success: true };
  }

  @Post('recovery-codes/generate')
  async generateRecoveryCodes(@Req() req): Promise<any> {
    const userId = req.user.id;
    const codes = await this.mfaService.generateRecoveryCodes(userId);
    return { recoveryCodes: codes };
  }

  @Post('recovery-codes/verify')
  async verifyRecoveryCode(@Req() req, @Body() verifyDto: VerifyRecoveryCodeDto): Promise<any> {
    const userId = req.user.id;
    const isValid = await this.mfaService.verifyRecoveryCode(userId, verifyDto);
    
    if (!isValid) {
      throw new NotFoundException('Invalid recovery code');
    }
    
    return { success: true };
  }
}
