import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class IeltsWritingDto {
  @IsString()
  @IsNotEmpty()
  essay!: string;

  @IsInt()
  @Min(1)
  userId!: number;
}
