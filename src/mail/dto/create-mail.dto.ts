import { IsEmail, IsNotEmpty } from 'class-validator';

export class CreateMailDto {
  @IsEmail()
  to: string;

  @IsNotEmpty()
  subject: string;

  @IsNotEmpty()
  body: string;
}
