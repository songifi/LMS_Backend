import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { CreateMailDto } from './dto/create-mail.dto';
import { Repository } from 'typeorm';
import { Mail } from './entities/mail.entity';
import { UpdateMailDto } from './dto/update-mail.dto';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService,

  @InjectRepository(Mail)
    private readonly mailRepository: Repository<Mail>,
  ) {
    // Configure email service
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('MAIL_HOST'),
      port: this.configService.get<number>('MAIL_PORT'),
      secure: this.configService.get<boolean>('MAIL_SECURE'),
      auth: {
        user: this.configService.get<string>('MAIL_USER'),
        pass: this.configService.get<string>('MAIL_PASSWORD'),
      },
    });
  }

  async sendVerificationEmail(email: string, token: string): Promise<void> {
    const appUrl = this.configService.get<string>('APP_URL');
    const verificationUrl = `${appUrl}/verify-email?token=${token}`;

    await this.transporter.sendMail({
      from: this.configService.get<string>('MAIL_FROM'),
      to: email,
      subject: 'Email Verification',
      html: `
        <h1>Verify Your Email</h1>
        <p>Please click the link below to verify your email address:</p>
        <a href="${verificationUrl}">Verify Email</a>
        <p>This link will expire in 24 hours.</p>
      `,
    });
  }

  async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    const appUrl = this.configService.get<string>('APP_URL');
    const resetUrl = `${appUrl}/reset-password?token=${token}`;

    await this.transporter.sendMail({
      from: this.configService.get<string>('MAIL_FROM'),
      to: email,
      subject: 'Password Reset',
      html: `
        <h1>Reset Your Password</h1>
        <p>Please click the link below to reset your password:</p>
        <a href="${resetUrl}">Reset Password</a>
        <p>This link will expire in 1 hour.</p>
      `,
    });
  }

  async create(createMailDto: CreateMailDto): Promise<string> {
    const { to, subject, body } = createMailDto;

    const mailOptions = {
      from: '"LMS Mailer" <no-reply@lms.com>',
      to,
      subject,
      text: body,
      html: `<p>${body}</p>`,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Message sent: %s', info.messageId);
      return `Email successfully sent to ${to}`;
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Failed to send email');
    }
  }

  // Find all sent emails
  async findAll(): Promise<Mail[]> {
    return await this.mailRepository.find();
  }

  // Find one email by ID
  async findOne(id: number): Promise<Mail | null> {
    const mail = await this.mailRepository.findOne({ where: { id } });
    return await this.mailRepository.findOne({ where: { id } });
  }

  // Update an email record (for example, update isSent status)
  async update(id: number, updateMailDto: UpdateMailDto): Promise<Mail | null> {
    const mail = await this.mailRepository.findOne({ where: { id } });
    await this.mailRepository.update(id, updateMailDto);
    return this.mailRepository.findOne({ where: { id } });
  }

  // Remove an email record
  async remove(id: number): Promise<void> {
    await this.mailRepository.delete(id);
  }
  
}