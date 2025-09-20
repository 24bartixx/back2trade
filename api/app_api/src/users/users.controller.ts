import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus
} from "@nestjs/common";
import { UsersService } from "./users.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { CreateUserResponseDto } from "./dto/create-user-response.dto";

@Controller("users")
@ApiTags("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: "Create a user",
    description: "Add a user to which you can add new participant"
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: "User created",
    type: CreateUserResponseDto
  })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @ApiOperation({
    summary: "Get all users",
    description: "Retrieve a list of all users in the system"
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "List of users retrieved successfully",
    type: [CreateUserResponseDto]
  })
  findAll() {
    return this.usersService.findAll();
  }

  @Get(":id")
  @ApiOperation({
    summary: "Get user by ID",
    description: "Retrieve detailed information about a specific user"
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "User details retrieved successfully",
    type: CreateUserResponseDto
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "User not found"
  })
  findOne(@Param("id") id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(":id")
  @ApiOperation({
    summary: "Get user by ID",
    description: "Retrieve detailed information about a specific user"
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "User details retrieved successfully",
    type: CreateUserResponseDto
  })
  update(@Param("id") id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(":id")
  @ApiOperation({
    summary: "Get user by ID",
    description: "Retrieve detailed information about a specific user"
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "User details retrieved successfully",
    type: CreateUserResponseDto
  })
  remove(@Param("id") id: string) {
    return this.usersService.remove(id);
  }
}
