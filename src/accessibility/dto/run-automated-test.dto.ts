import { IsString, IsArray, IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RunAutomatedTestDto {
  @ApiProperty({
    description: 'URL to run the accessibility tests on',
    example: 'https://example.com/course-page',
  })
  @IsString()
  url: string;

  @ApiProperty({
    description: 'Types of tests to run',
    example: ['wcag2aa', 'section508'],
    default: ['wcag2aa'],
  })
  @IsArray()
  @IsOptional()
  testTypes?: string[];

  @ApiProperty({
    description: 'Whether to include shadow DOM in the tests',
    example: true,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  includeShadowDom?: boolean;
}