import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Tokens } from '@app/common';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('local/signup')
  public localSignup(@Body() dto: CreateUserDto): Promise<Tokens> {
    return this.authService.localSignup(dto);
  }
}
