import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/prisma/prisma.service';
import { CreatePlanDto, UpdatePlanDto } from '../dto/plan.dto';

@Injectable()
export class PlansRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: CreatePlanDto, userId: string) {
    return this.prisma.academy_plan.create({
      data: {
        ...data,
        createdBy: userId,
      },
    });
  }

  async findAll(where?: any) {
    return this.prisma.academy_plan.findMany({
      where: {
        deletedAt: null,
        ...where,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.academy_plan.findUnique({
      where: { id, deletedAt: null },
    });
  }

  async update(id: string, data: UpdatePlanDto, userId: string) {
    return this.prisma.academy_plan.update({
      where: { id },
      data: {
        ...data,
        updatedBy: userId,
      },
    });
  }

  async softDelete(id: string, userId: string) {
    return this.prisma.academy_plan.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        updatedBy: userId,
      },
    });
  }

  async findActivePlans() {
    return this.prisma.academy_plan.findMany({
      where: {
        isActive: true,
        deletedAt: null,
      },
    });
  }
}
