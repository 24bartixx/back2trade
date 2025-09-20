import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class UsersService {
  constructor(private database: DatabaseService) {}

  async findMetadataOrFail(email: string) {
    const user = await this.database.user.findUnique({ where: { email } });
    if (user === null) {
      throw new NotFoundException('User were not found');
    }

    return user;
  }

  async create(createUsertDto: CreateUserDto) {
    return this.database.user.create({
      data: {
        email: createUsertDto.email,
        password: createUsertDto.password,
        username: createUsertDto.username
      }
    });
  }

  async findAll() {
    return this.database.user.findMany({
      select: {
        email: true,
        username: true
      }
    });
  }

  async findOne(email: string) {
    const user = await this.database.user.findUnique({
      where: { email },
      select: {
        email: true,
        username: true
      }
    });
    if (user === null) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async update(email: string, updateUserDto: UpdateUserDto) {
    return this.database.user.update({
      where: { email },
      data: {
        username: updateUserDto.username
      }
    });
  }

  async remove(email: string) {
    return this.database.user.delete({ where: { email } });
  }

  async findUser(email: string) {
    return this.database.user.findUnique({ where: { email } });
  }
}
