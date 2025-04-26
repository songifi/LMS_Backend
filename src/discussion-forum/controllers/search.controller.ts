import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { SearchForumDto } from '../dto/search-forum.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { SearchService } from '../providers/search.service';

@Controller('forum-search')
@UseGuards(JwtAuthGuard)
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  async search(@Query() searchDto: SearchForumDto, @Request() req) {
    return this.searchService.search(searchDto, req.user);
  }
}
