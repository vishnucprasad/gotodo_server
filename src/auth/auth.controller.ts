import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Tokens } from '@app/common';
import { CreateUserDto, SigninDto } from './dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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
