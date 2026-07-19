import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/prisma/prisma.service';
import { CreateAttendanceDto, UpdateAttendanceDto } from '../dto/attendance.dto';

@Injectable()
export class AttendancesRepository {
  constructor(private prisma: PrismaService) {}

  async checkIn(data: CreateAttendanceDto & { checkIn: Date; isWithinSchedule: boolean }) {
    return this.prisma.academy_attendance.create({
      data: {
        studentId: data.studentId,
        enrollmentId: data.enrollmentId,
        checkIn: data.checkIn,
        method: data.method || 'barcode',
        isWithinSchedule: data.isWithinSchedule,
        status: 'checked_in',
      },
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
                level: true,
              },
            },
          },
        },
      },
    });
  }

  async checkOut(id: string, checkOut: Date) {
    const attendance = await this.prisma.academy_attendance.findUnique({
      where: { id },
    });

    if (!attendance) return null;

    const duration = Math.floor((checkOut.getTime() - attendance.checkIn.getTime()) / (1000 * 60)); // minutos

    return this.prisma.academy_attendance.update({
      where: { id },
      data: {
        checkOut,
        duration,
        status: 'checked_out',
      },
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
  }

  async findTodayByStudent(studentId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return this.prisma.academy_attendance.findFirst({
      where: {
        studentId,
        checkIn: {
          gte: today,
          lt: tomorrow,
        },
        deletedAt: null,
      },
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
                level: true,
              },
            },
            plan: true,
          },
        },
      },
    });
  }

  async findByStudentId(studentId: string, limit = 20) {
    return this.prisma.academy_attendance.findMany({
      where: {
        studentId,
        deletedAt: null,
      },
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
      orderBy: { checkIn: 'desc' },
      take: limit,
    });
  }

  async findByGroupId(groupId: string, startDate?: Date, endDate?: Date) {
    const where: any = {
      enrollment: {
        groupId,
        deletedAt: null,
      },
      deletedAt: null,
    };

    if (startDate && endDate) {
      where.checkIn = {
        gte: startDate,
        lte: endDate,
      };
    }

    return this.prisma.academy_attendance.findMany({
      where,
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        enrollment: {
          select: {
            id: true,
            groupId: true,
          },
        },
      },
      orderBy: { checkIn: 'desc' },
    });
  }

  async getConsecutiveAbsences(studentId: string, enrollmentId: string) {
    // Obtener últimos 10 días de clase esperados
    const attendances = await this.prisma.academy_attendance.findMany({
      where: {
        studentId,
        enrollmentId,
        deletedAt: null,
      },
      orderBy: { checkIn: 'desc' },
      take: 10,
    });

    // Contar faltas consecutivas (días sin asistencia)
    let consecutiveAbsences = 0;
    const today = new Date();
    
    // TODO: Implementar lógica completa de conteo de faltas consecutivas
    // Comparando con los días esperados de clase según el horario del grupo

    return consecutiveAbsences;
  }
}
