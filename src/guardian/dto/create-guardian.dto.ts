import { ApiProperty } from "@nestjs/swagger"
import { IsEmail, IsNotEmpty, IsOptional, IsString } from "class-validator"

export class CreateGuardianDto {
  @ApiProperty({ description: "First name of the guardian", example: "John" })
  @IsNotEmpty()
  @IsString()
  firstName: string

  @ApiProperty({ description: "Last name of the guardian", example: "Doe" })
  @IsNotEmpty()
  @IsString()
  lastName: string

  @ApiProperty({ description: "Email address of the guardian", example: "john.doe@example.com" })
  @IsNotEmpty()
  @IsEmail()
  email: string

  @ApiProperty({ description: "Phone number of the guardian", example: "+1234567890", required: false })
  @IsOptional()
  @IsString()
  phoneNumber?: string

  @ApiProperty({ description: "Address of the guardian", example: "123 Main St, City", required: false })
  @IsOptional()
  @IsString()
  address?: string
}
