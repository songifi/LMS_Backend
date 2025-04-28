import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional, IsBoolean } from "class-validator"
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"

export class RegisterDto {
  @ApiProperty({
    description: "User first name",
    example: "John",
  })
  @IsNotEmpty()
  @IsString()
  firstName: string

  @ApiProperty({
    description: "User last name",
    example: "Doe",
  })
  @IsNotEmpty()
  @IsString()
  lastName: string

  @ApiProperty({
    description: "User email address",
    example: "john.doe@example.com",
  })
  @IsNotEmpty()
  @IsEmail()
  email: string

  @ApiProperty({
    description: "User password (min 8 characters)",
    example: "password123",
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  password: string

  @ApiPropertyOptional({
    description: "Faculty affiliation (if applicable)",
    example: "Computer Science",
  })
  @IsOptional()
  @IsString()
  facultyAffiliation?: string
}

export class VerifyEmailDto {
  @ApiProperty({
    description: "Email verification token",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @IsNotEmpty()
  @IsString()
  token: string
}

export class LoginDto {
  @ApiProperty({
    description: "User email address",
    example: "john.doe@example.com",
  })
  @IsNotEmpty()
  @IsEmail()
  email: string

  @ApiProperty({
    description: "User password",
    example: "password123",
  })
  @IsNotEmpty()
  @IsString()
  password: string

  @ApiPropertyOptional({
    description: "Remember user session",
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  rememberMe?: boolean
}

export class ForgotPasswordDto {
  @ApiProperty({
    description: "User email address",
    example: "john.doe@example.com",
  })
  @IsNotEmpty()
  @IsEmail()
  email: string
}

export class ResetPasswordDto {
  @ApiProperty({
    description: "Password reset token",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @IsNotEmpty()
  @IsString()
  token: string

  @ApiProperty({
    description: "New password (min 8 characters)",
    example: "newpassword123",
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  password: string
}

export class RefreshTokenDto {
  @ApiProperty({
    description: "Refresh token",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @IsNotEmpty()
  @IsString()
  refreshToken: string
}
