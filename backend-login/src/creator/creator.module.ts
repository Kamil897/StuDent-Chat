import { Module } from '@nestjs/common';
import { CreatorController } from './creator.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [CreatorController],
  providers: [PrismaService]
})
export class CreatorModule {}
