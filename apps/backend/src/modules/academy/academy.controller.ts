import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../../iam/guards/auth.guard';

@Controller('academy')
@UseGuards(AuthGuard)
export class AcademyController {
  @Get('status')
  getStatus() {
    return {
      module: 'Academy',
      status: 'active',
      submodules: ['plans', 'groups', 'students', 'enrollments', 'attendances'],
    };
  }
}
