import { Module } from '@nestjs/common';
import { PlansController } from './controllers/plans.controller';
import { PlansService } from './services/plans.service';
import { PlansRepository } from './repositories/plans.repository';
import { PrismaModule } from '../../../shared/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PlansController],
  providers: [PlansService, PlansRepository],
  exports: [PlansService, PlansRepository],
})
export class PlansModule {}