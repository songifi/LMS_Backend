import { ApiProperty } from '@nestjs/swagger';

export class CreateBadgeDto {
  @ApiProperty({ example: 'Early Bird', description: 'Title of the badge' })
  title: string;

  @ApiProperty({ example: 'https://example.com/badges/early-bird.png', description: 'URL of the badge icon' })
  iconUrl: string;
}
