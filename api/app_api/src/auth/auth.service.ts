import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UsersService } from "../users/users.service";
import { compare, hash } from "bcrypt";
import { CreateUserDto } from "src/users/dto/create-user.dto";
import { CreateUserResponseDto } from "src/users/dto/create-user-response.dto";
import { SignInDto } from "./dto/sign-in.dto";

@Injectable()
export class AuthService {
  userService: any;
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService
  ) {}

  async signIn(signInDto: SignInDto): Promise<{ access_token: string }> {
    const { email, password } = signInDto;

    const user = await this.usersService.findMetadata(email);

    if (user === null) {
      throw new NotFoundException("User does not exist");
    }

    const passwordMatches = await compare(password, user.password);
    if (!passwordMatches) {
      throw new UnauthorizedException("Incorrect password");
    }
    const payload = { sub: user.email, username: user.username };
    return {
      access_token: await this.jwtService.signAsync(payload)
    };
  }

  async register(createUserDto: CreateUserDto): Promise<CreateUserResponseDto> {
    const { email, password, username } = createUserDto;

    const userInBase = await this.usersService.findMetadata(email);
    const isEmailAvailable = userInBase == null;

    if (!isEmailAvailable) {
      throw new ConflictException("There is already a user with this email");
    }

    const salt = 10;
    const hashedPassword = await hash(password, salt);

    const user = await this.usersService.create({
      email,
      password: hashedPassword,
      username
    });

    return {
      email: user.email,
      username: user.username,
      message: "User created"
    };
  }
}
