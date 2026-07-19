import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { EnrollmentsService } from '../services/enrollments.service';
import { CreateEnrollmentDto, UpdateEnrollmentDto } from '../dto/enrollment.dto';
import { AuthGuard } from '../../../iam/guards/auth.guard';
import { PermissionsGuard } from '../../../iam/guards/permissions.guard';
import { RequirePermissions } from '../../../iam/decorators/permissions.decorator';
import { CurrentUser } from '../../../iam/decorators/current-user.decorator';

@Controller('academy/enrollments')
@UseGuards(AuthGuard, PermissionsGuard)
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  @Post()
  @RequirePermissions('academy.enrollments', 'create')
  create(@Body() createEnrollmentDto: CreateEnrollmentDto, @CurrentUser('id') userId: string) {
    return this.enrollmentsService.create(createEnrollmentDto, userId);
  }

  @Get()
  @RequirePermissions('academy.enrollments', 'read')
  findAll(@Query() filters?: any) {
    return this.enrollmentsService.findAll(filters);
  }

  @Get('student/:studentId')
  @RequirePermissions('academy.enrollments', 'read')
  findByStudentId(@Param('studentId') studentId: string) {
    return this.enrollmentsService.findByStudentId(studentId);
  }

  @Get('student/:studentId/active')
  @RequirePermissions('academy.enrollments', 'read')
  findActiveByStudentId(@Param('studentId') studentId: string) {
    return this.enrollmentsService.findActiveByStudentId(studentId);
  }

  @Get(':id')
  @RequirePermissions('academy.enrollments', 'read')
  findOne(@Param('id') id: string) {
    return this.enrollmentsService.findOne(id);
  }

  @Patch(':id')
  @RequirePermissions('academy.enrollments', 'update')
  update(
    @Param('id') id: string,
    @Body() updateEnrollmentDto: UpdateEnrollmentDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.enrollmentsService.update(id, updateEnrollmentDto, userId);
  }

  @Delete(':id')
  @RequirePermissions('academy.enrollments', 'delete')
  remove(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.enrollmentsService.remove(id, userId);
  }

  @Post(':id/freeze')
  @RequirePermissions('academy.enrollments', 'update')
  freeze(
    @Param('id') id: string,
    @Body() body: { reason?: string },
    @CurrentUser('id') userId: string,
  ) {
    return this.enrollmentsService.freeze(id, userId, body.reason);
  }

  @Post(':id/unfreeze')
  @RequirePermissions('academy.enrollments', 'update')
  unfreeze(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.enrollmentsService.unfreeze(id, userId);
  }
}
