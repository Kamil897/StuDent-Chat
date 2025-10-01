import { ArrayNotEmpty, IsArray, IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class IeltsReadingDto {
  @IsString()
  @IsNotEmpty()
  testId!: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  answers!: string[];

  @IsInt()
  @Min(1)
  userId!: number;
}
