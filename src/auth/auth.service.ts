import { Injectable, UnauthorizedException, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmailVerification } from './entities/email-verification.entity';
import { PasswordReset } from './entities/password-reset.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { RegisterDto, LoginDto, ForgotPasswordDto, ResetPasswordDto, RefreshTokenDto } from './dto/auth.dto';
import { Request } from 'express';
import { UsersService } from 'src/user/providers/user.service';
import { RolesService } from 'src/user/providers/role.service';
import { User } from 'src/user/entities/user.entity';
import { MailService } from 'src/mail/mail.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private rolesService: RolesService,
    private jwtService: JwtService,
    private mailService: MailService,
    private configService: ConfigService,
    @InjectRepository(EmailVerification)
    private emailVerificationsRepository: Repository<EmailVerification>,
    @InjectRepository(PasswordReset)
    private passwordResetsRepository: Repository<PasswordReset>,
    @InjectRepository(RefreshToken)
    private refreshTokensRepository: Repository<RefreshToken>,
  ) {}

  async register(registerDto: RegisterDto): Promise<User> {
    try {
      // Create new user with student role by default
      const studentRole = await this.rolesService.findByName('student');
      if (!studentRole) {
        throw new NotFoundException('Student role not found');
      }

      const user = await this.usersService.create({
        ...registerDto,
        roleIds: [studentRole.id],
        isActive: false, // User is inactive until email verification
      });

      // Generate email verification token
      const token = this.generateToken();
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24); // 24 hours expiration

      const emailVerification = this.emailVerificationsRepository.create({
        token,
        expiresAt,
        user,
      });
      await this.emailVerificationsRepository.save(emailVerification);

      // Send verification email
      await this.mailService.sendVerificationEmail(user.email, token);

      return user;
    } catch (error) {
      if (error.code === '23505') { // PostgreSQL unique constraint violation
        throw new ConflictException('Email already exists');
      }
      throw error;
    }
  }

  async verifyEmail(token: string): Promise<void> {
    const verification = await this.emailVerificationsRepository.findOne({
      where: { token },
      relations: ['user'],
    });

    if (!verification) {
      throw new BadRequestException('Invalid verification token');
    }

    if (verification.expiresAt < new Date()) {
      throw new BadRequestException('Verification token has expired');
    }

    // Activate user
    verification.user.isActive = true;
    await this.usersService.update(String(verification.user.id), { isActive: true });

    // Remove verification token
    await this.emailVerificationsRepository.remove(verification);
  }

  async login(loginDto: LoginDto, req: Request): Promise<{
    accessToken: string;
    refreshToken?: string;
    expiresIn: number;
    user: Partial<User>;
  }> {
    // Find user by email
    const user = await this.usersService.findByEmail(loginDto.email);

    // Check if user is active
    if (!user.isActive) {
      throw new UnauthorizedException('Please verify your email first');
    }

    // Validate password
    const isPasswordValid = await this.usersService.checkPassword(user, loginDto.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate JWT token
    const payload = {
      sub: user.id,
      email: user.email,
      roles: user.roles.map(role => role.name),
    };

    // Access token valid for 15 minutes
    const accessTokenExpiresIn = 60 * 15; // 15 minutes in seconds
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: accessTokenExpiresIn,
    });

    let refreshToken: RefreshToken | null = null;

    // If remember me is enabled, generate a refresh token valid for 30 days
    if (loginDto.rememberMe) {
      refreshToken = await this.generateRefreshToken(user, req);
    }

    // Return user without password
    const { password, ...result } = user;

    return {
      accessToken,
      refreshToken: refreshToken?.token,
      expiresIn: accessTokenExpiresIn,
      user: result,
    };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<void> {
    // Find user by email
    const user = await this.usersService.findByEmail(forgotPasswordDto.email);

    // Generate password reset token
    const token = this.generateToken();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour expiration

    // Save token to database
    const passwordReset = this.passwordResetsRepository.create({
      token,
      expiresAt,
      user,
    });
    await this.passwordResetsRepository.save(passwordReset);

    // Send password reset email
    await this.mailService.sendPasswordResetEmail(user.email, token);
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<void> {
    const { token, password } = resetPasswordDto;

    // Find password reset token
    const passwordReset = await this.passwordResetsRepository.findOne({
      where: { token },
      relations: ['user'],
    });

    if (!passwordReset) {
      throw new BadRequestException('Invalid reset token');
    }

    if (passwordReset.expiresAt < new Date()) {
      throw new BadRequestException('Reset token has expired');
    }

    // Update user password
    await this.usersService.update(String(passwordReset.user.id), { password });

    // Remove password reset token
    await this.passwordResetsRepository.remove(passwordReset);
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto): Promise<{
    accessToken: string;
    expiresIn: number;
  }> {
    // Find refresh token
    const storedRefreshToken = await this.refreshTokensRepository.findOne({
      where: { token: refreshTokenDto.refreshToken, isRevoked: false },
      relations: ['user'],
    });

    if (!storedRefreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (storedRefreshToken.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token has expired');
    }

    // Generate new access token
    const user = storedRefreshToken.user;
    const payload = {
      sub: user.id,
      email: user.email,
      roles: user.roles.map(role => role.name),
    };

    const accessTokenExpiresIn = 60 * 15; // 15 minutes in seconds
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: accessTokenExpiresIn,
    });

    return {
      accessToken,
      expiresIn: accessTokenExpiresIn,
    };
  }

  async logout(refreshToken: string): Promise<void> {
    if (!refreshToken) {
      return;
    }

    // Find and revoke refresh token
    const storedRefreshToken = await this.refreshTokensRepository.findOne({
      where: { token: refreshToken, isRevoked: false },
    });

    if (storedRefreshToken) {
      storedRefreshToken.isRevoked = true;
      await this.refreshTokensRepository.save(storedRefreshToken);
    }
  }

  async getUserFromToken(token: string): Promise<User> {
    try {
      const payload = this.jwtService.verify(token);
      return this.usersService.findById(payload.sub);
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  async revokeUserTokens(userId: string): Promise<void> {
    const tokens = await this.refreshTokensRepository.find({
      where: { userId, isRevoked: false },
    });

    for (const token of tokens) {
      token.isRevoked = true;
      await this.refreshTokensRepository.save(token);
    }
  }

  // Helper methods
  private generateToken(size: number = 32): string {
    return crypto.randomBytes(size).toString('hex');
  }

  private async generateRefreshToken(user: User, req: Request): Promise<RefreshToken> {
    // Cleanup old refresh tokens for this user
    await this.cleanupRefreshTokens(String(user.id));

    // Create new refresh token
    const token = this.generateToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days expiration

    const refreshToken = this.refreshTokensRepository.create({
      token,
      expiresAt,
      user,
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip,
    });

    return this.refreshTokensRepository.save(refreshToken);
  }

  private async cleanupRefreshTokens(userId: string): Promise<void> {
    // Remove expired tokens
    await this.refreshTokensRepository
      .createQueryBuilder()
      .delete()
      .where('userId = :userId', { userId })
      .andWhere('expiresAt < :now', { now: new Date() })
      .execute();

    // Limit number of active tokens per user (keep only the latest 5)
    const tokens = await this.refreshTokensRepository.find({
      where: { userId, isRevoked: false },
      order: { createdAt: 'DESC' },
    });

    if (tokens.length > 5) {
      const tokensToRevoke = tokens.slice(5);
      for (const token of tokensToRevoke) {
        token.isRevoked = true;
        await this.refreshTokensRepository.save(token);
      }
    }
  }
}