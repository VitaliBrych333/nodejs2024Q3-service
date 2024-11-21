import * as bcrypt from 'bcrypt';
import {
  Injectable,
  HttpException,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private userService: UserService,
  ) {}

  async login(user: CreateUserDto) {
    const dbUser = await this.userService.getByLogin(user.login);

    const checkPassword = await bcrypt.compare(user.password, dbUser.password);

    if (!dbUser || !checkPassword) {
      throw new HttpException(
        'No user with this credentials',
        HttpStatus.FORBIDDEN,
      );
    }

    return await this.generateAccessAndRefreshTokens({
      userId: dbUser.id,
      login: dbUser.login,
    });
  }

  async signup(createUserDto: CreateUserDto) {
    const user = await this.userService.createUser(createUserDto);
    return user;
  }

  async refresh(updateAuthDto: UpdateAuthDto) {
    if (!updateAuthDto.refreshToken) {
      throw new UnauthorizedException();
    }

    let login: string;
    let userId: string;

    try {
      const payload: { userId: string; login: string } =
        await this.jwtService.verifyAsync(updateAuthDto.refreshToken, {
          secret: process.env.JWT_SECRET_REFRESH_KEY,
        });

      login = payload.login;
      userId = payload.userId;
    } catch (error) {
      throw new HttpException('Authentication failed ', HttpStatus.FORBIDDEN);
    }

    return await this.generateAccessAndRefreshTokens({ login, userId });
  }

  private async generateAccessAndRefreshTokens(payload: {
    userId: string;
    login: string;
  }) {
    return {
      accessToken: await this.jwtService.signAsync(payload),
      refreshToken: await this.jwtService.signAsync(payload, {
        expiresIn: process.env.TOKEN_REFRESH_EXPIRE_TIME,
        secret: process.env.JWT_SECRET_REFRESH_KEY,
      }),
    };
  }
}
