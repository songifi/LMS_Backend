import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MailService } from './mail.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Mail } from './entities/mail.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Mail]), ConfigModule],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}