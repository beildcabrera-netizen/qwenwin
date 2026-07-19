import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../shared/prisma/prisma.service';
import { CreateEnrollmentDto, UpdateEnrollmentDto } from '../dto/enrollment.dto';

@Injectable()
export class EnrollmentsRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateEnrollmentDto & { startDate: Date; endDate: Date }, userId: string) {
    return this.prisma.academy_enrollment.create({
      data: {
        studentId: data.studentId,
        groupId: data.groupId,
        planId: data.planId,
        startDate: data.startDate,
        endDate: data.endDate,
        isActive: data.isActive ?? true,
        createdBy: userId,
      },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            ci: true,
          },
        },
        group: {
          select: {
            id: true,
            name: true,
            level: true,
            maxCapacity: true,
          },
        },
        plan: {
          select: {
            id: true,
            name: true,
            category: true,
            price: true,
            durationDays: true,
          },
        },
      },
    });
  }

  async findAll(where?: any) {
    return this.prisma.academy_enrollment.findMany({
      where: {
        deletedAt: null,
        ...where,
      },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            ci: true,
          },
        },
        group: {
          select: {
            id: true,
            name: true,
            level: true,
          },
        },
        plan: {
          select: {
            id: true,
            name: true,
            category: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.academy_enrollment.findUnique({
      where: { id, deletedAt: null },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            ci: true,
            phone: true,
            guardianPhone: true,
          },
        },
        group: {
          include: {
            schedules: true,
          },
        },
        plan: true,
        attendances: {
          where: { deletedAt: null },
          orderBy: { checkIn: 'desc' },
          take: 10,
        },
        payments: {
          where: { deletedAt: null },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });
  }

  async findByStudentId(studentId: string) {
    return this.prisma.academy_enrollment.findMany({
      where: {
        studentId,
        deletedAt: null,
      },
      include: {
        group: {
          select: {
            id: true,
            name: true,
            level: true,
          },
        },
        plan: {
          select: {
            id: true,
            name: true,
            category: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findActiveEnrollmentByStudent(studentId: string) {
    return this.prisma.academy_enrollment.findFirst({
      where: {
        studentId,
        isActive: true,
        deletedAt: null,
      },
      include: {
        group: {
          include: {
            schedules: true,
          },
        },
        plan: true,
      },
    });
  }

  async update(id: string, data: UpdateEnrollmentDto, userId: string) {
    return this.prisma.academy_enrollment.update({
      where: { id },
      data: {
        ...data,
        updatedBy: userId,
      },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        group: {
          select: {
            id: true,
            name: true,
            level: true,
          },
        },
        plan: {
          select: {
            id: true,
            name: true,
            category: true,
          },
        },
      },
    });
  }

  async softDelete(id: string, userId: string) {
    return this.prisma.academy_enrollment.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        updatedBy: userId,
        isActive: false,
      },
    });
  }

  async checkScheduleConflict(studentId: string, groupId: string, excludeEnrollmentId?: string) {
    // Obtener horarios del grupo objetivo
    const targetGroupSchedules = await this.prisma.academy_group_schedule.findMany({
      where: { groupId },
    });

    if (targetGroupSchedules.length === 0) return false;

    // Obtener inscripciones activas del estudiante
    const enrollments = await this.prisma.academy_enrollment.findMany({
      where: {
        studentId,
        isActive: true,
        deletedAt: null,
        ...(excludeEnrollmentId && { id: { not: excludeEnrollmentId } }),
      },
      include: {
        group: {
          include: {
            schedules: true,
          },
        },
      },
    });

    // Verificar conflictos de horario
    for (const enrollment of enrollments) {
      for (const targetSchedule of targetGroupSchedules) {
        for (const existingSchedule of enrollment.group.schedules) {
          if (existingSchedule.dayOfWeek === targetSchedule.dayOfWeek) {
            // Verificar superposición de horarios
            const hasOverlap = 
              (targetSchedule.startTime < existingSchedule.endTime && 
               targetSchedule.endTime > existingSchedule.startTime);
            
            if (hasOverlap) {
              return true; // Hay conflicto
            }
          }
        }
      }
    }

    return false; // No hay conflicto
  }

  async getGroupCapacity(groupId: string) {
    const group = await this.prisma.academy_group.findUnique({
      where: { id: groupId, deletedAt: null },
      include: {
        _count: {
          select: {
            enrollments: {
              where: {
                isActive: true,
                deletedAt: null,
              },
            },
          },
        },
      },
    });

    if (!group) return null;

    return {
      maxCapacity: group.maxCapacity,
      currentEnrollment: group._count.enrollments,
      availableSpots: group.maxCapacity - group._count.enrollments,
      isFull: group._count.enrollments >= group.maxCapacity,
    };
  }
}
