import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import mongoose, { Connection, Model } from 'mongoose';
import { request, spec } from 'pactum';
import { AppModule } from '../src/app.module';
import { User } from '../src/auth/schemas';
import { CreateUserDto } from '../src/auth/dto/create-user.dto';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let db: Connection;

  beforeAll(async () => {
    db = await mongoose.createConnection(process.env.MONGO_URI, {});

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [MongooseModule.forRoot(process.env.MONGO_URI), AppModule],
    }).compile();

    const userModel: Model<User> = moduleFixture.get<Model<User>>(
      getModelToken(User.name),
    );

    await userModel.deleteMany({});

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );

    await app.init();
    app.listen(3001);

    request.setBaseUrl('http://localhost:3001');
  });

  afterAll(() => {
    app.close();
  });

  describe('AUTH /auth', () => {
    describe('POST /auth/local/signup', () => {
      const signupRequest = () => spec().post('/auth/local/signup');
      const signupDto: CreateUserDto = {
        name: 'John',
        email: 'johndoe@gmail.com',
        password: 'Johndoe@123',
      };

      it('should throw an error if name is not provided in the body', () => {
        const dto: Omit<CreateUserDto, 'name'> = {
          email: signupDto.email,
          password: signupDto.password,
        };

        return signupRequest().withBody(dto).expectStatus(400);
      });

      it('should throw an error if email is not provided in the body', () => {
        const dto: Omit<CreateUserDto, 'email'> = {
          name: signupDto.name,
          password: signupDto.password,
        };

        return signupRequest().withBody(dto).expectStatus(400);
      });

      it('should throw an error if password is not provided in the body', () => {
        const dto: Omit<CreateUserDto, 'password'> = {
          name: signupDto.name,
          email: signupDto.email,
        };

        return signupRequest().withBody(dto).expectStatus(400);
      });

      it('should throw an error if provided password is not strong enough', () => {
        const dto: CreateUserDto = {
          name: signupDto.name,
          email: signupDto.email,
          password: '123',
        };

        return signupRequest().withBody(dto).expectStatus(400);
      });

      it('should signup', () => {
        return signupRequest()
          .withBody(signupDto)
          .expectStatus(201)
          .stores('at', 'access_token')
          .stores('rt', 'refresh_token');
      });
    });
  });
});
