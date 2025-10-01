import { Body, Controller, Post } from '@nestjs/common';
import { IeltsService } from './ielts.service';
import { IeltsWritingDto, IeltsReadingDto } from './dto';

@Controller('ielts')
export class IeltsController {
  constructor(private readonly ieltsService: IeltsService) {}

  @Post('writing/score')
  async scoreWriting(@Body() dto: IeltsWritingDto) {
    return this.ieltsService.scoreWriting(dto);
  }

  @Post('reading/score')
  async scoreReading(@Body() dto: IeltsReadingDto) {
    return this.ieltsService.scoreReading(dto);
  }
}
