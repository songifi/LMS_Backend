import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpStatus,
  HttpCode,
} from "@nestjs/common"
import { UsersService } from "./providers/user.service"
import { CreateUserDto } from "./dto/create-user.dto"
import { UpdateUserDto } from "./dto/update-user.dto"
import { QueryUserDto } from "./dto/query-user.dto"
import { RolesGuard } from "../auth/guards/role.guard"
import { Roles } from "../auth/decorators/roles.decorator"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiNoContentResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
} from "@nestjs/swagger"

@ApiTags("users")
@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new user' })
  @ApiCreatedResponse({ description: 'User successfully created' })
  @ApiUnauthorizedResponse({ description: 'User not authenticated' })
  @ApiForbiddenResponse({ description: 'User does not have admin role' })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  async create(@Body() createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);

    if (!user) {
      throw new Error('User creation failed'); // Handle error accordingly
    }
  
    const { password, ...result } = user;
    return result;
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all users with pagination and filtering' })
  @ApiOkResponse({ description: 'List of users' })
  @ApiUnauthorizedResponse({ description: 'User not authenticated' })
  @ApiForbiddenResponse({ description: 'User does not have admin role' })
  findAll(@Query() queryParams: QueryUserDto) {
    return this.usersService.findAll(queryParams);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiOkResponse({ description: 'User details' })
  @ApiUnauthorizedResponse({ description: 'User not authenticated' })
  @ApiNotFoundResponse({ description: 'User not found' })
  async findOne(@Param('id') id: string) {
    const user = await this.usersService.findById(id);
    const { password, ...result } = user;
    return result;
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "Update user" })
  @ApiParam({ name: "id", description: "User ID" })
  @ApiOkResponse({ description: "User updated successfully" })
  @ApiUnauthorizedResponse({ description: "User not authenticated" })
  @ApiForbiddenResponse({ description: "User does not have admin role" })
  @ApiNotFoundResponse({ description: "User not found" })
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    const user = await this.usersService.update(id, updateUserDto)
    const { password, ...result } = user
    return result
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete user' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiNoContentResponse({ description: 'User deleted successfully' })
  @ApiUnauthorizedResponse({ description: 'User not authenticated' })
  @ApiForbiddenResponse({ description: 'User does not have admin role' })
  @ApiNotFoundResponse({ description: 'User not found' })
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  @Patch(':id/deactivate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Deactivate user' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiOkResponse({ description: 'User deactivated successfully' })
  @ApiUnauthorizedResponse({ description: 'User not authenticated' })
  @ApiForbiddenResponse({ description: 'User does not have admin role' })
  @ApiNotFoundResponse({ description: 'User not found' })
  async deactivate(@Param('id') id: string) {
    const user = await this.usersService.deactivate(id);
    const { password, ...result } = user;
    return result;
  }
}
