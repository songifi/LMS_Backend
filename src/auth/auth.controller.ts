import { Controller, Post, Body, Get, UseGuards, Req, HttpCode, HttpStatus } from "@nestjs/common"
import { AuthService } from "./auth.service"
import {
  RegisterDto,
  VerifyEmailDto,
  LoginDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  RefreshTokenDto,
} from "./dto/auth.dto"
import { JwtAuthGuard } from "./guards/jwt-auth.guard"
import { Public } from "./decorators/public.decorator"
import { CurrentUser } from "./decorators/current-user.decorator"
import { ThrottlerGuard } from "@nestjs/throttler"
import { Request } from "express"
import { User } from "src/user/entities/user.entity"
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiUnauthorizedResponse,
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiCreatedResponse,
} from "@nestjs/swagger"

@ApiTags("auth")
@Controller("auth")
@UseGuards(ThrottlerGuard)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiCreatedResponse({ 
    description: 'User successfully registered',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Registration successful. Please check your email for verification.' },
        user: { 
          type: 'object',
          properties: {
            id: { type: 'number', example: 1 },
            firstName: { type: 'string', example: 'John' },
            lastName: { type: 'string', example: 'Doe' },
            email: { type: 'string', example: 'john.doe@example.com' },
          }
        }
      }
    }
  })
  @ApiBadRequestResponse({ description: 'Invalid input data or email already exists' })
  async register(@Body() registerDto: RegisterDto) {
    const user = await this.authService.register(registerDto);
    const { password, ...result } = user;
    return {
      message: 'Registration successful. Please check your email for verification.',
      user: result,
    };
  }

  @Public()
  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify user email address' })
  @ApiOkResponse({ description: 'Email verified successfully' })
  @ApiBadRequestResponse({ description: 'Invalid or expired verification token' })
  async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto) {
    await this.authService.verifyEmail(verifyEmailDto.token);
    return { message: 'Email verified successfully' };
  }

  @Public()
  @Post("login")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "User login" })
  @ApiOkResponse({
    description: "Login successful",
    schema: {
      type: "object",
      properties: {
        accessToken: { type: "string" },
        refreshToken: { type: "string" },
        expiresIn: { type: "number", example: 900 },
        user: {
          type: "object",
          properties: {
            id: { type: "number", example: 1 },
            firstName: { type: "string", example: "John" },
            lastName: { type: "string", example: "Doe" },
            email: { type: "string", example: "john.doe@example.com" },
            roles: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "number", example: 1 },
                  name: { type: "string", example: "STUDENT" },
                },
              },
            },
          },
        },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: "Invalid credentials or unverified email" })
  async login(@Body() loginDto: LoginDto, @Req() req: Request) {
    return this.authService.login(loginDto, req)
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiOkResponse({ description: 'User profile data' })
  @ApiUnauthorizedResponse({ description: 'User not authenticated' })
  async getProfile(@CurrentUser() user: User) {
    const { password, ...result } = user;
    return result;
  }

  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request password reset' })
  @ApiOkResponse({ description: 'Password reset email sent' })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    await this.authService.forgotPassword(forgotPasswordDto);
    return { message: 'Password reset email sent' };
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password with token' })
  @ApiOkResponse({ description: 'Password reset successful' })
  @ApiBadRequestResponse({ description: 'Invalid or expired reset token' })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    await this.authService.resetPassword(resetPasswordDto);
    return { message: 'Password reset successful' };
  }

  @Public()
  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiOkResponse({ 
    description: 'New access token',
    schema: {
      type: 'object',
      properties: {
        accessToken: { type: 'string' },
        expiresIn: { type: 'number', example: 900 }
      }
    }
  })
  @ApiUnauthorizedResponse({ description: 'Invalid or expired refresh token' })
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'User logout' })
  @ApiOkResponse({ description: 'Logged out successfully' })
  async logout(@Req() req: Request) {
    const refreshToken = req.body.refreshToken;
    await this.authService.logout(refreshToken);
    return { message: 'Logged out successfully' };
  }
}
