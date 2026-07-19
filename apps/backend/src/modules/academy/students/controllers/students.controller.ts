import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { StudentsService } from '../services/students.service';
import { CreateStudentDto, UpdateStudentDto } from '../dto/student.dto';
import { AuthGuard } from '../../../iam/guards/auth.guard';
import { PermissionsGuard } from '../../../iam/guards/permissions.guard';
import { RequirePermissions } from '../../../iam/decorators/permissions.decorator';
import { CurrentUser } from '../../../iam/decorators/current-user.decorator';

@Controller('academy/students')
@UseGuards(AuthGuard, PermissionsGuard)
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Post()
  @RequirePermissions('academy.students', 'create')
  create(@Body() createStudentDto: CreateStudentDto, @CurrentUser('id') userId: string) {
    return this.studentsService.create(createStudentDto, userId);
  }

  @Get()
  @RequirePermissions('academy.students', 'read')
  findAll(@Query() filters?: any) {
    return this.studentsService.findAll(filters);
  }

  @Get('active')
  @RequirePermissions('academy.students', 'read')
  findActive() {
    return this.studentsService.getActiveStudents();
  }

  @Get('birthdays/this-week')
  @RequirePermissions('academy.students', 'read')
  getBirthdaysThisWeek() {
    return this.studentsService.getStudentsWithBirthdaysThisWeek();
  }

  @Get(':id')
  @RequirePermissions('academy.students', 'read')
  findOne(@Param('id') id: string) {
    return this.studentsService.findOne(id);
  }

  @Get('barcode/:barcode')
  @RequirePermissions('academy.students', 'read')
  findByBarcode(@Param('barcode') barcode: string) {
    return this.studentsService.findByBarcode(barcode);
  }

  @Patch(':id')
  @RequirePermissions('academy.students', 'update')
  update(
    @Param('id') id: string,
    @Body() updateStudentDto: UpdateStudentDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.studentsService.update(id, updateStudentDto, userId);
  }

  @Delete(':id')
  @RequirePermissions('academy.students', 'delete')
  remove(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.studentsService.remove(id, userId);
  }
}
