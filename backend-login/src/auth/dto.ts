import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(3)
  firstName!: string;

  @IsString()
  @MinLength(2)
  lastName!: string;

  @IsString()
  @MinLength(3)
  username!: string; // если нужен логин отдельно

  @IsString()
  @MinLength(6)
  password!: string;

  @IsOptional()
  @IsString()
  hobby?: string;

  @IsOptional()
  @IsString()
  education?: string;

  @IsOptional()
  @IsString()
  avatar?: string;
}

export class LoginDto {
  @IsEmail() email!: string;
  @IsString() password!: string;
}
