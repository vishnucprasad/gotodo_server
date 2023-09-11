import { Exclude, Expose, Transform } from 'class-transformer';

export class UserDto {
  @Expose()
  @Transform((params) => params.obj._id.toString())
  public readonly _id: string;

  public readonly name: string;
  public readonly email: string;
  public readonly createdAt: string;
  public readonly updatedAt: string;

  @Exclude()
  public hash: string;

  @Exclude()
  public rtHash: string;

  constructor(partial: Partial<UserDto>) {
    Object.assign(this, partial);
  }
}
