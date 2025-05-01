import { IsString, IsNotEmpty } from 'class-validator';

export class CreateHierarchyDto {
  @IsString()
  @IsNotEmpty()
  parentRoleId: string;

  @IsString()
  @IsNotEmpty()
  childRoleId: string;
}