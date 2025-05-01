import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  Query 
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';

@ApiTags('courses')
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new course' })
  create(@Body() createCourseDto: CreateCourseDto) {
    return this.coursesService.create(createCourseDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all courses' })
  findAll(
    @Query('page') page = 1, 
    @Query('limit') limit = 10,
    @Query('department') department?: string,
    @Query('search') search?: string,
  ) {
    return this.coursesService.findAll(page, limit, department, search);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a course by ID' })
  findOne(@Param('id') id: string) {
    return this.coursesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a course' })
  update(@Param('id') id: string, @Body() updateCourseDto: UpdateCourseDto) {
    return this.coursesService.update(id, updateCourseDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a course' })
  remove(@Param('id') id: string) {
    return this.coursesService.remove(id);
  }
  
  @Get(':id/prerequisites')
  @ApiOperation({ summary: 'Get course prerequisites' })
  getPrerequisites(@Param('id') id: string) {
    return this.coursesService.getPrerequisites(id);
  }
  
  @Get(':id/related')
  @ApiOperation({ summary: 'Get related courses' })
  getRelatedCourses(@Param('id') id: string) {
    return this.coursesService.getRelatedCourses(id);
  }
}