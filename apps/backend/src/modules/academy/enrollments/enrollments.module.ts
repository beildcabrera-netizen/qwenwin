import { Module } from '@nestjs/common';
import { EnrollmentsController } from './controllers/enrollments.controller';
import { EnrollmentsService } from './services/enrollments.service';
import { EnrollmentsRepository } from './repositories/enrollments.repository';
import { PrismaModule } from '../../../shared/prisma/prisma.module';
import { StudentsModule } from '../students/students.module';
import { GroupsModule } from '../groups/groups.module';
import { PlansModule } from '../plans/plans.module';

@Module({
  imports: [PrismaModule, StudentsModule, GroupsModule, PlansModule],
  controllers: [EnrollmentsController],
  providers: [EnrollmentsService, EnrollmentsRepository],
  exports: [EnrollmentsService, EnrollmentsRepository],
})
export class EnrollmentsModule {}