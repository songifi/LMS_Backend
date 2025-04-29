import { Controller, Get, Post, Body, Param, Put, Delete, ParseUUIDPipe } from "@nestjs/common"
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from "@nestjs/swagger"
import { CategoriesService } from "../providers/categories.service";
import { ResourceCategory } from "../entities/resource-category.entity";
import { CreateCategoryDto } from "../dto/create-category.dto";

@ApiTags("categories")
@Controller("resources/categories")
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @ApiOperation({ summary: "Get all categories" })
  @ApiResponse({ status: 200, description: "Return all categories", type: [ResourceCategory] })
  findAll(): Promise<ResourceCategory[]> {
    return this.categoriesService.findAll()
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a category by ID' })
  @ApiParam({ name: 'id', description: 'Category ID' })
  @ApiResponse({ status: 200, description: 'Return the category', type: ResourceCategory })
  @ApiResponse({ status: 404, description: 'Category not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<ResourceCategory> {
    return this.categoriesService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new category' })
  @ApiBody({ type: CreateCategoryDto })
  @ApiResponse({ status: 201, description: 'The category has been created', type: ResourceCategory })
  create(@Body() createCategoryDto: CreateCategoryDto): Promise<ResourceCategory> {
    return this.categoriesService.create(createCategoryDto);
  }

  @Put(":id")
  @ApiOperation({ summary: "Update a category" })
  @ApiParam({ name: "id", description: "Category ID" })
  @ApiBody({ type: CreateCategoryDto })
  @ApiResponse({ status: 200, description: "The category has been updated", type: ResourceCategory })
  @ApiResponse({ status: 404, description: "Category not found" })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCategoryDto: CreateCategoryDto,
  ): Promise<ResourceCategory> {
    return this.categoriesService.update(id, updateCategoryDto)
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a category' })
  @ApiParam({ name: 'id', description: 'Category ID' })
  @ApiResponse({ status: 200, description: 'The category has been deleted' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.categoriesService.remove(id);
  }
}
