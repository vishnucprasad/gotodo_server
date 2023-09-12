import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import mongoose, { Connection, Model } from 'mongoose';
import { request, spec } from 'pactum';
import { AppModule } from '../src/app.module';
import { User } from '../src/auth/schemas';
import {
  ChangePasswordDto,
  CreateUserDto,
  EditUserDto,
  SigninDto,
} from '../src/auth/dto/';
import { Category } from '../src/category/schemas';
import { CreateCategoryDto, EditCategoryDto } from '../src/category/dto';

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
    const categoryModel: Model<Category> = moduleFixture.get<Model<Category>>(
      getModelToken(Category.name),
    );

    await userModel.deleteMany({});
    await categoryModel.deleteMany({});

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

    describe('GET /auth/user', () => {
      const getUserRequest = () => spec().get('/auth/user');

      it('should throw an error if access token not provided as authorization bearer', () => {
        return getUserRequest().expectStatus(401);
      });

      it('should get user details', () => {
        return getUserRequest()
          .withBearerToken('$S{at}')
          .expectStatus(200)
          .stores('userId', '_id');
      });
    });

    describe('POST /auth/refresh', () => {
      const refreshRequest = () => spec().post('/auth/refresh');

      it('should throw an error if refresh token not provided as authorization bearer', () => {
        return refreshRequest().expectStatus(401);
      });

      it('should throw an error if access token is provided instead of refresh token as authorization bearer', () => {
        return refreshRequest().withBearerToken('$S{at}').expectStatus(401);
      });

      it('should refresh the token', () => {
        return refreshRequest()
          .withBearerToken('$S{rt}')
          .expectStatus(201)
          .stores('at', 'access_token')
          .stores('rt', 'refresh_token');
      });
    });

    describe('PATCH /auth/user/edit', () => {
      const editUserRequest = () => spec().patch('/auth/user/edit');
      const editUserDto: EditUserDto = {
        name: 'John Smith',
      };

      it('should throw an error if access token not provided as authorization bearer', () => {
        return editUserRequest().withBody(editUserDto).expectStatus(401);
      });

      it('should edit user', () => {
        return editUserRequest()
          .withBearerToken('$S{at}')
          .withBody(editUserDto)
          .expectStatus(200);
      });
    });

    describe('PATCH /auth/user/password', () => {
      const changePasswordRequest = () => spec().patch('/auth/user/password');
      const changePasswordDto: ChangePasswordDto = {
        currentPassword: 'Johndoe@123',
        newPassword: 'John@123',
      };

      it('should throw an error if access token not provided as authorization bearer', () => {
        return changePasswordRequest()
          .withBody(changePasswordDto)
          .expectStatus(401);
      });

      it('should throw an error if currentPassword is not provided in the body', () => {
        const dto: Omit<ChangePasswordDto, 'currentPassword'> = {
          newPassword: changePasswordDto.newPassword,
        };

        return changePasswordRequest()
          .withBearerToken('$S{at}')
          .withBody(dto)
          .expectStatus(400);
      });

      it('should throw an error if newPassword is not provided in the body', () => {
        const dto: Omit<ChangePasswordDto, 'newPassword'> = {
          currentPassword: changePasswordDto.currentPassword,
        };

        return changePasswordRequest()
          .withBearerToken('$S{at}')
          .withBody(dto)
          .expectStatus(400);
      });

      it('should change password', () => {
        return changePasswordRequest()
          .withBearerToken('$S{at}')
          .withBody(changePasswordDto)
          .expectStatus(200)
          .expectBodyContains(changePasswordDto.currentPassword)
          .expectBodyContains(changePasswordDto.newPassword);
      });
    });

    describe('DELETE /auth/signout', () => {
      const signoutRequest = () => spec().delete('/auth/signout');

      it('should throw an error if access token not provided as authorization bearer', () => {
        return signoutRequest().expectStatus(401);
      });

      it('should signout the user', () => {
        return signoutRequest().withBearerToken('$S{at}').expectStatus(204);
      });
    });
  });

  describe('CATEGORY /category', () => {
    describe('POST /category/create', () => {
      const createCategoryRequest = () => spec().post('/category/create');
      const createCategoryDto: CreateCategoryDto = {
        name: 'Work',
        color: '#ffffff',
      };

      it('should throw an error if access token not provided as authorization bearer', () => {
        return createCategoryRequest()
          .withBody(createCategoryDto)
          .expectStatus(401);
      });

      it('should throw an error if name is not provided in the body', () => {
        const dto: Omit<CreateCategoryDto, 'color'> = {
          name: createCategoryDto.name,
        };

        return createCategoryRequest()
          .withBearerToken('$S{at}')
          .withBody(dto)
          .expectStatus(400);
      });

      it('should throw an error if color is not provided in the body', () => {
        const dto: Omit<CreateCategoryDto, 'name'> = {
          color: createCategoryDto.color,
        };

        return createCategoryRequest()
          .withBearerToken('$S{at}')
          .withBody(dto)
          .expectStatus(400);
      });

      it('should throw an error if length of color string provided in the body is short', () => {
        const dto: CreateCategoryDto = {
          name: createCategoryDto.name,
          color: '#fff',
        };

        return createCategoryRequest()
          .withBearerToken('$S{at}')
          .withBody(dto)
          .expectStatus(400);
      });

      it('should create a new category', () => {
        return createCategoryRequest()
          .withBearerToken('$S{at}')
          .withBody(createCategoryDto)
          .expectStatus(201)
          .expectBodyContains(createCategoryDto.name)
          .expectBodyContains(createCategoryDto.color)
          .stores('categoryId', '_id');
      });
    });

    describe('GET /category/all', () => {
      const getCategoriesRequest = () => spec().get('/category/all');

      it('should throw an error if access token not provided as authorization bearer', () => {
        return getCategoriesRequest().expectStatus(401);
      });

      it('should get all categories', () => {
        return getCategoriesRequest()
          .withBearerToken('$S{at}')
          .expectStatus(200);
      });
    });

    describe('GET /category/:id', () => {
      const getCategoryRequest = () => spec().get('/category/{id}');

      it('should throw an error if access token not provided as authorization bearer', () => {
        return getCategoryRequest()
          .withPathParams({ id: '$S{categoryId}' })
          .expectStatus(401);
      });

      it('should throw an error if provided category id is invalid', () => {
        return getCategoryRequest()
          .withPathParams({ id: '$S{userId}' })
          .withBearerToken('$S{at}')
          .expectStatus(404);
      });

      it('should get category', () => {
        return getCategoryRequest()
          .withPathParams({ id: '$S{categoryId}' })
          .withBearerToken('$S{at}')
          .expectStatus(200);
      });
    });

    describe('PATCH /category/:id', () => {
      const editCategoryRequest = () => spec().patch('/category/{id}');
      const editCategoryDto: EditCategoryDto = {
        name: 'Personal',
      };

      it('should throw an error if access token not provided as authorization bearer', () => {
        return editCategoryRequest()
          .withPathParams({ id: '$S{categoryId}' })
          .withBody(editCategoryDto)
          .expectStatus(401);
      });

      it('should throw an error if provided category id is invalid', () => {
        return editCategoryRequest()
          .withPathParams({ id: '$S{userId}' })
          .withBearerToken('$S{at}')
          .withBody(editCategoryDto)
          .expectStatus(404);
      });

      it('should throw an error if length of color string provided in the body is short', () => {
        const dto: EditCategoryDto = {
          color: '#fff',
        };

        return editCategoryRequest()
          .withPathParams({ id: '$S{categoryId}' })
          .withBearerToken('$S{at}')
          .withBody(dto)
          .expectStatus(400);
      });

      it('should edit category', () => {
        return editCategoryRequest()
          .withPathParams({ id: '$S{categoryId}' })
          .withBearerToken('$S{at}')
          .withBody(editCategoryDto)
          .expectStatus(200)
          .expectBodyContains(editCategoryDto.name);
      });
    });
  });
});
