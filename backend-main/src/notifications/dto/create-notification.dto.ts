import { IsInt, IsString } from 'class-validator';

export class CreateNotificationDto {
  @IsInt()
  parent_id: number | null;

  @IsString()
  message: string | null;

  @IsInt()
  sent_at: number | null;
}
