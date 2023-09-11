import { JwtPayload, Tokens } from '@app/common';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as argon from 'argon2';
import { CreateUserDto } from './dto/create-user.dto';
import { UserRepository } from './repositories/user.repository';
import { Types } from 'mongoose';

@Injectable()
export class AuthService {
  constructor(
    private readonly config: ConfigService,
    private readonly userRepo: UserRepository,
    private readonly jwt: JwtService,
  ) {}

  public async localSignup(dto: CreateUserDto): Promise<Tokens> {
    const session = await this.userRepo.startTransaction();

    try {
      const hash = await this.hashData(dto.password);
      const user = await this.userRepo.create(
        {
          name: dto.name,
          email: dto.email,
          hash,
        },
        { session },
      );

      await session.commitTransaction();

      const payload: JwtPayload = {
        sub: user._id.toHexString(),
        email: user.email,
      };

      const tokens = await this.generateTokens(payload);
      await this.updateRtHash(user._id, tokens.refresh_token);
      return tokens;
    } catch (e) {
      await session.abortTransaction();
      throw e;
    }
  }

  private hashData(data: string): Promise<string> {
    return argon.hash(data);
  }

  private async generateTokens(payload: JwtPayload): Promise<Tokens> {
    const [at, rt] = await Promise.all([
      this.jwt.signAsync(payload, {
        expiresIn: '10m',
        secret: this.config.get<string>('AT_SECRET'),
      }),
      this.jwt.signAsync(payload, {
        expiresIn: '30d',
        secret: this.config.get<string>('RT_SECRET'),
      }),
    ]);

    return {
      access_token: at,
      refresh_token: rt,
    };
  }

  private async updateRtHash(
    userId: Types.ObjectId,
    rt: string,
  ): Promise<void> {
    const hash = await this.hashData(rt);
    const session = await this.userRepo.startTransaction();

    try {
      await this.userRepo.findOneAndUpdate(
        { _id: userId },
        { rtHash: hash },
        { session },
      );
      await session.commitTransaction();
    } catch (e) {
      await session.abortTransaction();
      throw e;
    }
  }
}
