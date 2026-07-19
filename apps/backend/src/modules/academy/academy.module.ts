import { Module } from '@nestjs/common';
import { AcademyController } from './academy.controller';
import { PlansModule } from './plans/plans.module';
import { GroupsModule } from './groups/groups.module';
import { StudentsModule } from './students/students.module';
import { EnrollmentsModule } from './enrollments/enrollments.module';
import { AttendancesModule } from './attendances/attendances.module';
import { PaymentsModule } from './payments/payments.module';
import { TurnsModule } from './turns/turns.module';
import { LiquidationsModule } from './liquidations/liquidations.module';

@Module({
  imports: [
    PlansModule,
    GroupsModule,
    StudentsModule,
    EnrollmentsModule,
    AttendancesModule,
    PaymentsModule,
    TurnsModule,
    LiquidationsModule,
  ],
  controllers: [AcademyController],
})
export class AcademyModule {}
