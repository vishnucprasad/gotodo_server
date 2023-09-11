import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import mongoose, { Connection, Model } from 'mongoose';
import { request, spec } from 'pactum';
import { AppModule } from '../src/app.module';
import { User } from '../src/auth/schemas';
import { CreateUserDto, SigninDto } from '../src/auth/dto/';

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

    describe('POST /auth/local/signin', () => {
      const signinRequest = () => spec().post('/auth/local/signin');
      const signinDto: SigninDto = {
        email: 'johndoe@gmail.com',
        password: 'Johndoe@123',
      };

      it('should throw an error if email is not provided in the body', () => {
        const dto: Omit<SigninDto, 'email'> = {
          password: signinDto.password,
        };

        return signinRequest().withBody(dto).expectStatus(400);
      });

      it('should throw an error if password is not provided in the body', () => {
        const dto: Omit<SigninDto, 'password'> = {
          email: signinDto.email,
        };

        return signinRequest().withBody(dto).expectStatus(400);
      });

      it('should throw an error if there is no user with the provided email', () => {
        const dto: SigninDto = {
          email: 'test@test.com',
          password: signinDto.password,
        };

        return signinRequest().withBody(dto).expectStatus(403);
      });

      it('should throw an error if provided password is invalid', () => {
        const dto: SigninDto = {
          email: signinDto.email,
          password: 'Test@1234',
        };

        return signinRequest().withBody(dto).expectStatus(403);
      });

      it('should signin', () => {
        return signinRequest()
          .withBody(signinDto)
          .expectStatus(200)
          .stores('at', 'access_token')
          .stores('rt', 'refresh_token');
      });
    });
  });
});
