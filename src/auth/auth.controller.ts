import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AtGuard, CurrentUser, Tokens } from '@app/common';
import { CreateUserDto, SigninDto, UserDto } from './dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(AtGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @Get('user')
  public getCurrentUser(@CurrentUser() user: UserDto): UserDto {
    return new UserDto(user);
  }

  @Post('local/signup')
  public localSignup(@Body() dto: CreateUserDto): Promise<Tokens> {
    return this.authService.localSignup(dto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('local/signin')
  public localSignin(@Body() dto: SigninDto): Promise<Tokens> {
    return this.authService.localSignin(dto);
  }
}
