import { Body, Controller, Post } from '@nestjs/common';
import { HistoryService } from './history.service';

class AddHistoryDto {
  userId!: number;
  examType!: string;
  result!: any;
}

@Controller('api/history')
export class HistoryController {
  constructor(private readonly historyService: HistoryService) {}

  @Post('add')
  async add(@Body() dto: AddHistoryDto) {
    return this.historyService.add(dto.userId, dto.examType, dto.result);
  }
}


