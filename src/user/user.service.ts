import * as bcrypt from 'bcrypt';
import { omit } from 'lodash';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdatePasswordDto } from './dto/update-user.dto';
import { DatabaseService } from '../database/database.service';

const saltRounds = +process.env.CRYPT_SALT;

@Injectable()
export class UserService {
  constructor(private readonly databaseService: DatabaseService) {}

  async getUsers() {
    const users = await this.databaseService.user.findMany();
    return users;
  }

  async createUser(userDto: CreateUserDto) {
    if (!(userDto.login && userDto.password)) {
      throw new BadRequestException('Invalid data');
    }
    userDto.password = await bcrypt.hash(userDto.password, saltRounds);

    const user = await this.databaseService.user.create({
      data: userDto,
    });

    const newUser = omit(user, ['password']);

    return {
      ...newUser,
      createdAt: new Date(newUser.createdAt).getTime(),
      updatedAt: new Date(newUser.updatedAt).getTime(),
    };
  }

  async getUserById(id: string) {
    const user = await this.databaseService.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('This user does not exist');
    }

    return omit(user, ['password']);
  }

  async updateUserById(id: string, updateUserDto: UpdatePasswordDto) {
    if (
      !(updateUserDto.oldPassword && updateUserDto.newPassword) ||
      typeof updateUserDto.oldPassword !== 'string' ||
      typeof updateUserDto.newPassword !== 'string'
    ) {
      throw new BadRequestException('Invalid data');
    }

    const user = await this.databaseService.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('This user does not exist');
    }

    const checkPassword = await bcrypt.compare(
      updateUserDto.oldPassword,
      user.password,
    );

    if (!checkPassword) {
      throw new ForbiddenException('Old password is wrong');
    }

    const newUser = await this.databaseService.user.update({
      where: { id: id },
      data: {
        password: await bcrypt.hash(updateUserDto.newPassword, saltRounds),
        version: { increment: 1 },
      },
    });

    return {
      ...omit(newUser, ['password']),
      createdAt: new Date(newUser.createdAt).getTime(),
      updatedAt: new Date(newUser.updatedAt).getTime(),
    };
  }

  async deleteUserById(id: string) {
    const user = await this.databaseService.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('This user is not exist');
    }

    await this.databaseService.user.delete({
      where: { id },
    });
  }

  async getByLogin(login: string) {
    const user = await this.databaseService.user.findFirst({
      where: { login: login },
    });

    if (!user) {
      throw new NotFoundException('This user does not exist');
    }

    return user;
  }
}
