import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { SignInDto } from "./dto/sign-in.dto";
import { CreateUserResponseDto } from "src/users/dto/create-user-response.dto";
import { CreateUserDto } from "../users/dto/create-user.dto";

@Controller("auth")
@ApiTags("auth")
export class AuthController {
  constructor(private readonly authSerivce: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post("login")
  @ApiOperation({
    summary: "Log in",
    description: "Log in with email and password to receive JWT token"
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: "User sign in",
    type: CreateUserResponseDto
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: "Wrong login credentials"
  })
  signIn(@Body() signInDto: SignInDto) {
    return this.authSerivce.signIn(signInDto);
  }

  @HttpCode(HttpStatus.CREATED)
  @Post("register")
  @ApiOperation({
    summary: "Register a new user",
    description: "Register a new user with email, username and password"
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: "User created",
    type: CreateUserResponseDto
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: "There is already a user with this email"
  })
  register(@Body() createUserDto: CreateUserDto) {
    return this.authSerivce.register(createUserDto);
  }
}
