import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
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
import { User } from 'src/user/entities/user.entity';
import { MailService } from 'src/mail/mail.service';
import { ConfigService } from '@nestjs/config';
import { RoleService } from 'src/user/providers/role.service';
import { RoleEnum } from 'src/user/role.enum'; // ⬅️ Added RoleEnum import!

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private rolesService: RoleService,
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
      // Fetch student role using RoleEnum
      const studentRole = await this.rolesService.findByName(RoleEnum.STUDENT);

      const user = await this.usersService.create({
        ...registerDto,
        roleIds: [studentRole.id],
        isActive: false, // User inactive until email verification
      });

      // Generate email verification token
      const token = this.generateToken();
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      const emailVerification = this.emailVerificationsRepository.create({
        token,
        expiresAt,
        user,
      });
      await this.emailVerificationsRepository.save(emailVerification);

      await this.mailService.sendVerificationEmail(user.email, token);

      return user;
    } catch (error) {
      if (error.code === '23505') {
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

    verification.user.isActive = true;
    await this.usersService.update(String(verification.user.id), { isActive: true });

    await this.emailVerificationsRepository.remove(verification);
  }

  async login(loginDto: LoginDto, req: Request): Promise<{
    accessToken: string;
    refreshToken?: string;
    expiresIn: number;
    user: Partial<User>;
  }> {
    const user = await this.usersService.findByEmail(loginDto.email);

    if (!user.isActive) {
      throw new UnauthorizedException('Please verify your email first');
    }

    const isPasswordValid = await this.usersService.checkPassword(user, loginDto.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      roles: user.roles.map(role => role.name),
    };

    const accessTokenExpiresIn = 60 * 15;
    const accessToken = this.jwtService.sign(payload, { expiresIn: accessTokenExpiresIn });

    let refreshToken: RefreshToken | null = null;

    if (loginDto.rememberMe) {
      refreshToken = await this.generateRefreshToken(user, req);
    }

    const { password, ...result } = user;

    return {
      accessToken,
      refreshToken: refreshToken?.token,
      expiresIn: accessTokenExpiresIn,
      user: result,
    };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<void> {
    const user = await this.usersService.findByEmail(forgotPasswordDto.email);

    const token = this.generateToken();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    const passwordReset = this.passwordResetsRepository.create({
      token,
      expiresAt,
      user,
    });
    await this.passwordResetsRepository.save(passwordReset);

    await this.mailService.sendPasswordResetEmail(user.email, token);
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<void> {
    const { token, password } = resetPasswordDto;

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

    await this.usersService.update(String(passwordReset.user.id), { password });

    await this.passwordResetsRepository.remove(passwordReset);
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto): Promise<{
    accessToken: string;
    expiresIn: number;
  }> {
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

    const user = storedRefreshToken.user;
    const payload = {
      sub: user.id,
      email: user.email,
      roles: user.roles.map(role => role.name),
    };

    const accessTokenExpiresIn = 60 * 15;
    const accessToken = this.jwtService.sign(payload, { expiresIn: accessTokenExpiresIn });

    return {
      accessToken,
      expiresIn: accessTokenExpiresIn,
    };
  }

  async logout(refreshToken: string): Promise<void> {
    if (!refreshToken) {
      return;
    }

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

  private generateToken(size = 32): string {
    return crypto.randomBytes(size).toString('hex');
  }

  private async generateRefreshToken(user: User, req: Request): Promise<RefreshToken> {
    await this.cleanupRefreshTokens(String(user.id));

    const token = this.generateToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

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
    await this.refreshTokensRepository
      .createQueryBuilder()
      .delete()
      .where('userId = :userId', { userId })
      .andWhere('expiresAt < :now', { now: new Date() })
      .execute();

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
