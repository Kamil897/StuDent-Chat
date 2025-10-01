import { Module } from '@nestjs/common';
import { CogniyaController } from './cogniya.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [CogniyaController],
  providers: [PrismaService]
})
export class CogniyaModule {}
