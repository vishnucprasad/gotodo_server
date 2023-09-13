import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CurrentUser, Public } from '@app/common';
import {
  ChangePasswordDto,
  CreateUserDto,
  EditUserDto,
  SigninDto,
  UserDto,
} from './dto';
import { RtGuard } from './guards';
import { Tokens } from './types';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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

  @UseInterceptors(ClassSerializerInterceptor)
  @Patch('user/edit')
  public editUser(
    @CurrentUser('_id') userId: string,
    @Body() dto: EditUserDto,
  ): Promise<UserDto> {
    return this.authService.editUser(userId, dto);
  }

  @Patch('user/password')
  public changePassword(
    @CurrentUser('_id') userId: string,
    @Body() dto: ChangePasswordDto,
  ): Promise<ChangePasswordDto> {
    return this.authService.changePassword(userId, dto);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('signout')
  public signout(@CurrentUser('_id') userId: string): Promise<void> {
    return this.authService.signout(userId);
  }
}
