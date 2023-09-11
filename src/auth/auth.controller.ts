import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AtGuard, CurrentUser, Public, Tokens } from '@app/common';
import { CreateUserDto, SigninDto, UserDto } from './dto';
import { RtGuard } from './guards';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(AtGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @Get('user')
  public getCurrentUser(@CurrentUser() user: UserDto): UserDto {
    return new UserDto(user);
  }

  @Public()
  @Post('local/signup')
  public localSignup(@Body() dto: CreateUserDto): Promise<Tokens> {
    return this.authService.localSignup(dto);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('local/signin')
  public localSignin(@Body() dto: SigninDto): Promise<Tokens> {
    return this.authService.localSignin(dto);
  }

  @Public()
  @UseGuards(RtGuard)
  @Post('refresh')
  public refreshTokens(
    @CurrentUser('_id') userId: string,
    @CurrentUser('rt') rt: string,
  ): Promise<Tokens> {
    return this.authService.refreshTokens(userId, rt);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('signout')
  public signout(@CurrentUser('_id') userId: string): Promise<void> {
    return this.authService.signout(userId);
  }
}
