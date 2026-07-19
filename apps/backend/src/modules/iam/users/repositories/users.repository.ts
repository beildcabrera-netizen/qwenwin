import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { User } from '@prisma/client';

@Injectable()
export class UsersRepository {
  constructor(private prisma: PrismaService) {}

  async findAll(includeDeleted = false): Promise<User[]> {
    return this.prisma.user.findMany({
      where: includeDeleted ? {} : { deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string, includeRoles = false): Promise<User | null> {
    const include = includeRoles
      ? {
          roles: {
            include: {
              role: {
                include: {
                  permissions: {
                    include: {
                      permission: true,
                    },
                  },
                },
              },
            },
          },
        }
      : {};

    return this.prisma.user.findUnique({
      where: { id },
      include,
    });
  }

  async findByBarcode(barcode: string): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: { barcode, deletedAt: null },
    });
  }

  async findByCi(ci: string): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: { ci, deletedAt: null },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: { email, deletedAt: null },
    });
  }

  async create(data: any): Promise<User> {
    return this.prisma.user.create({ data });
  }

  async update(id: string, data: any): Promise<User> {
    const existing = await this.findById(id);
    if (!existing) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async softDelete(id: string): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async assignRole(userId: string, roleId: string): Promise<void> {
    await this.prisma.userRole.create({
      data: { userId, roleId, assignedBy: 'system' },
    });
  }

  async removeRole(userId: string, roleId: string): Promise<void> {
    await this.prisma.userRole.delete({
      where: { userId_roleId: { userId, roleId } },
    });
  }

  async getAttendanceLogs(userId: string, startDate?: Date, endDate?: Date) {
    return this.prisma.attendanceLog.findMany({
      where: {
        userId,
        entryTime: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { entryTime: 'desc' },
    });
  }
}
