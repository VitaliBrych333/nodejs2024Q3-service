import { Controller, Post, HttpCode, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { Public } from './public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('signup')
  @HttpCode(201)
  async signup(@Body() createUserDto: CreateUserDto) {
    return await this.authService.signup(createUserDto);
  }

  @Public()
  @Post('login')
  async login(@Body() createUserDto: CreateUserDto) {
    return await this.authService.login(createUserDto);
  }

  @Public()
  @Post('refresh')
  @HttpCode(200)
  async refresh(@Body() updateAuthDto: UpdateAuthDto) {
    return await this.authService.refresh(updateAuthDto);
  }
}
