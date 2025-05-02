import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CredentialService } from './credential.service';
import { CreateCredentialDto } from './dto/create-credential.dto';

@ApiTags('Credentials')
@Controller('credentials')
export class CredentialController {
  constructor(private readonly credentialService: CredentialService) {}

  @Post('issue')
  @ApiOperation({ summary: 'Issue new credential' })
  issue(@Body() dto: CreateCredentialDto) {
    return this.credentialService.issueCredential(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get user credentials' })
  getUserCredentials(@Query('userId') userId: string) {
    return this.credentialService.findUserCredentials(Number(userId));
  }
}
