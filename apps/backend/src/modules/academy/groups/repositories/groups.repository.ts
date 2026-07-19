import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/prisma/prisma.service';
import { CreateGroupDto, UpdateGroupDto } from '../dto/group.dto';

@Injectable()
export class GroupsRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateGroupDto & { schedules: any[] }, userId: string) {
    const { schedules, ...groupData } = data;
    
    return this.prisma.academy_group.create({
      data: {
        ...groupData,
        createdBy: userId,
        schedules: {
          create: schedules.map((schedule) => ({
            dayOfWeek: schedule.dayOfWeek,
            startTime: schedule.startTime,
            endTime: schedule.endTime,
          })),
        },
      },
      include: {
        schedules: true,
        professor: {
          select: {
            id: true,
            name: true,
            lastName: true,
          },
        },
        _count: {
          select: { enrollments: true },
        },
      },
    });
  }

  async findAll(where?: any) {
    return this.prisma.academy_group.findMany({
      where: {
        deletedAt: null,
        ...where,
      },
      include: {
        schedules: true,
        professor: {
          select: {
            id: true,
            name: true,
            lastName: true,
          },
        },
        _count: {
          select: { enrollments: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.academy_group.findUnique({
      where: { id, deletedAt: null },
      include: {
        schedules: true,
        professor: {
          select: {
            id: true,
            name: true,
            lastName: true,
          },
        },
        _count: {
          select: { enrollments: true },
        },
      },
    });
  }

  async update(id: string, data: UpdateGroupDto & { schedules?: any[] }, userId: string) {
    const { schedules, ...groupData } = data;

    const updateData: any = {
      ...groupData,
      updatedBy: userId,
    };

    if (schedules) {
      // Eliminar horarios existentes y crear nuevos
      updateData.schedules = {
        deleteMany: {},
        create: schedules.map((schedule) => ({
          dayOfWeek: schedule.dayOfWeek,
          startTime: schedule.startTime,
          endTime: schedule.endTime,
        })),
      };
    }

    return this.prisma.academy_group.update({
      where: { id },
      data: updateData,
      include: {
        schedules: true,
        professor: {
          select: {
            id: true,
            name: true,
            lastName: true,
          },
        },
        _count: {
          select: { enrollments: true },
        },
      },
    });
  }

  async softDelete(id: string, userId: string) {
    return this.prisma.academy_group.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        updatedBy: userId,
      },
    });
  }

  async findActiveGroups() {
    return this.prisma.academy_group.findMany({
      where: {
        isActive: true,
        deletedAt: null,
      },
      include: {
        schedules: true,
        _count: {
          select: { enrollments: true },
        },
      },
    });
  }

  async getGroupOccupancy(groupId: string) {
    const group = await this.prisma.academy_group.findUnique({
      where: { id: groupId, deletedAt: null },
      include: {
        _count: {
          select: { enrollments: true },
        },
      },
    });

    if (!group) return null;

    const occupancyPercentage = (group._count.enrollments / group.maxCapacity) * 100;

    return {
      groupId: group.id,
      groupName: group.name,
      maxCapacity: group.maxCapacity,
      currentEnrollment: group._count.enrollments,
      occupancyPercentage: Math.round(occupancyPercentage * 100) / 100,
      availableSpots: group.maxCapacity - group._count.enrollments,
    };
  }
}
