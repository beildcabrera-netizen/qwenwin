import { Module } from '@nestjs/common';
import { AttendancesController } from './controllers/attendances.controller';
import { AttendancesService } from './services/attendances.service';
import { AttendancesRepository } from './repositories/attendances.repository';
import { PrismaModule } from '../../../shared/prisma/prisma.module';
import { StudentsModule } from '../students/students.module';
import { GroupsModule } from '../groups/groups.module';

@Module({
  imports: [PrismaModule, StudentsModule, GroupsModule],
  controllers: [AttendancesController],
  providers: [AttendancesService, AttendancesRepository],
  exports: [AttendancesService, AttendancesRepository],
})
export class AttendancesModule {}