import { Module } from '@nestjs/common';
import { LiquidationsController } from './liquidations.controller';
import { LiquidationsService } from './liquidations.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { LateArrivalPolicy } from './policies/late-arrival.policy';
import { EarlyDeparturePolicy } from './policies/early-departure.policy';
import { OvertimePolicy } from './policies/overtime.policy';

@Module({
  imports: [PrismaModule],
  controllers: [LiquidationsController],
  providers: [
    LiquidationsService,
    LateArrivalPolicy,
    EarlyDeparturePolicy,
    OvertimePolicy,
  ],
  exports: [LiquidationsService],
})
export class LiquidationsModule {}
