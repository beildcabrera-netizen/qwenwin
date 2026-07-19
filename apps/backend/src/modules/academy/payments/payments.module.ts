import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { AntiquityDiscountStrategy } from './strategies/antiquity-discount.strategy';
import { DiscountContext } from './strategies/discount.context';

@Module({
  imports: [PrismaModule],
  controllers: [PaymentsController],
  providers: [
    PaymentsService,
    AntiquityDiscountStrategy,
    DiscountContext,
  ],
  exports: [PaymentsService],
})
export class PaymentsModule {}
