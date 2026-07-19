import { Module } from '@nestjs/common';
import { TurnsController } from './turns.controller';
import { TurnsService } from './turns.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TurnsController],
  providers: [TurnsService],
  exports: [TurnsService],
})
export class TurnsModule {}
