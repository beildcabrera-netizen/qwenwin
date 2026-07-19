import { Controller, Get, Post, Body, Param, UseGuards, Query } from '@nestjs/common';
import { AttendancesService } from '../services/attendances.service';
import { AuthGuard } from '../../../iam/guards/auth.guard';
import { PermissionsGuard } from '../../../iam/guards/permissions.guard';
import { RequirePermissions } from '../../../iam/decorators/permissions.decorator';
import { CurrentUser } from '../../../iam/decorators/current-user.decorator';

@Controller('academy/attendances')
@UseGuards(AuthGuard, PermissionsGuard)
export class AttendancesController {
  constructor(private readonly attendancesService: AttendancesService) {}

  @Post('check-in')
  @RequirePermissions('academy.attendances', 'create')
  checkIn(
    @Body() body: { studentId: string; enrollmentId: string; method?: 'barcode' | 'manual' },
    @CurrentUser('id') userId: string,
  ) {
    return this.attendancesService.checkIn(body.studentId, body.enrollmentId, body.method);
  }

  @Post(':id/check-out')
  @RequirePermissions('academy.attendances', 'update')
  checkOut(@Param('id') id: string) {
    return this.attendancesService.checkOut(id);
  }

  @Get('student/:studentId/today')
  @RequirePermissions('academy.attendances', 'read')
  getTodayAttendance(@Param('studentId') studentId: string) {
    return this.attendancesService.getTodayAttendance(studentId);
  }

  @Get('student/:studentId/history')
  @RequirePermissions('academy.attendances', 'read')
  getHistoryByStudent(
    @Param('studentId') studentId: string,
    @Query('limit') limit?: number,
  ) {
    return this.attendancesService.getHistoryByStudent(studentId, limit ? parseInt(limit) : 20);
  }

  @Get('group/:groupId')
  @RequirePermissions('academy.attendances', 'read')
  getAttendanceByGroup(
    @Param('groupId') groupId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return this.attendancesService.getAttendanceByGroup(groupId, start, end);
  }

  @Get('student/:studentId/enrollment/:enrollmentId/absences')
  @RequirePermissions('academy.attendances', 'read')
  getConsecutiveAbsences(
    @Param('studentId') studentId: string,
    @Param('enrollmentId') enrollmentId: string,
  ) {
    return this.attendancesService.getConsecutiveAbsences(studentId, enrollmentId);
  }
}
