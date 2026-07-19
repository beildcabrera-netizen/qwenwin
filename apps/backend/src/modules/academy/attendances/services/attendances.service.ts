import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { AttendancesRepository } from '../repositories/attendances.repository';
import { CreateAttendanceDto, UpdateAttendanceDto, AttendanceResponseDto } from '../dto/attendance.dto';

@Injectable()
export class AttendancesService {
  constructor(private attendancesRepository: AttendancesRepository) {}

  async checkIn(studentId: string, enrollmentId: string, method: 'barcode' | 'manual' = 'barcode'): Promise<any> {
    // Verificar si ya registró entrada hoy
    const todayAttendance = await this.attendancesRepository.findTodayByStudent(studentId);
    if (todayAttendance && !todayAttendance.checkOut) {
      throw new BadRequestException('El estudiante ya registró entrada hoy. Debe registrar salida primero.');
    }

    // TODO: Validar que la inscripción esté activa
    // TODO: Validar horario (ventana de tiempo con tolerancia)
    const isWithinSchedule = true; // Placeholder - implementar validación real

    const checkInTime = new Date();

    const attendance = await this.attendancesRepository.checkIn({
      studentId,
      enrollmentId,
      checkIn: checkInTime,
      method,
      isWithinSchedule,
    });

    return {
      success: true,
      type: 'student',
      action: 'check_in',
      name: `${attendance.student.firstName} ${attendance.student.lastName}`,
      group: attendance.enrollment.group.name,
      message: `Entrada registrada: ${attendance.student.firstName} ${attendance.student.lastName} - ${attendance.enrollment.group.level}`,
      sound: 'ding',
      attendance,
    };
  }

  async checkOut(attendanceId: string): Promise<any> {
    const attendance = await this.attendancesRepository.findUnique(attendanceId);
    if (!attendance) {
      throw new NotFoundException(`Registro de asistencia con ID ${attendanceId} no encontrado`);
    }

    if (attendance.checkOut) {
      throw new BadRequestException('El estudiante ya registró salida anteriormente.');
    }

    const checkOutTime = new Date();
    const updatedAttendance = await this.attendancesRepository.checkOut(attendanceId, checkOutTime);

    return {
      success: true,
      type: 'student',
      action: 'check_out',
      name: `${updatedAttendance.student.firstName} ${updatedAttendance.student.lastName}`,
      group: updatedAttendance.enrollment.group.name,
      message: `Salida registrada: ${updatedAttendance.student.firstName} ${updatedAttendance.student.lastName}`,
      sound: 'dong',
      duration: updatedAttendance.duration,
      attendance: updatedAttendance,
    };
  }

  async getTodayAttendance(studentId: string) {
    return this.attendancesRepository.findTodayByStudent(studentId);
  }

  async getHistoryByStudent(studentId: string, limit = 20) {
    return this.attendancesRepository.findByStudentId(studentId, limit);
  }

  async getAttendanceByGroup(groupId: string, startDate?: Date, endDate?: Date) {
    return this.attendancesRepository.findByGroupId(groupId, startDate, endDate);
  }

  async getConsecutiveAbsences(studentId: string, enrollmentId: string): Promise<number> {
    return this.attendancesRepository.getConsecutiveAbsences(studentId, enrollmentId);
  }
}

// Método auxiliar faltante en el repositorio
AttendancesRepository.prototype.findUnique = async function(id: string) {
  return this.prisma.academy_attendance.findUnique({
    where: { id, deletedAt: null },
    include: {
      student: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
      enrollment: {
        include: {
          group: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });
};
