import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { IeltsController } from './ielts.controller';
import { IeltsService } from './ielts.service';

@Module({
  imports: [HttpModule],
  controllers: [IeltsController],
  providers: [IeltsService],
})
export class IeltsModule {}


