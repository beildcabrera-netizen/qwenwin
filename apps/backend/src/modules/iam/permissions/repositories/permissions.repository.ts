import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreatePermissionDto, UpdatePermissionDto } from '../dto/create-permission.dto';

@Injectable()
export class PermissionsRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: CreatePermissionDto) {
    // Verificar duplicado por módulo y acción
    const existing = await this.prisma.permissions.findFirst({
      where: {
        module: data.module,
        action: data.action,
        deletedAt: null,
      },
    });

    if (existing) {
      throw new ConflictException('El permiso ya existe para este módulo y acción');
    }

    return this.prisma.permissions.create({
      data: {
        module: data.module,
        action: data.action,
        description: data.description,
      },
    });
  }

  async findAll(includeDeleted = false) {
    const where = includeDeleted ? {} : { deletedAt: null };
    return this.prisma.permissions.findMany({
      where,
      orderBy: [{ module: 'asc' }, { action: 'asc' }],
    });
  }

  async findById(id: string, includeDeleted = false) {
    const where = { id };
    if (!includeDeleted) {
      where['deletedAt'] = null;
    }
    return this.prisma.permissions.findUnique({ where });
  }

  async findByModule(module: string) {
    return this.prisma.permissions.findMany({
      where: { module, deletedAt: null },
      orderBy: { action: 'asc' },
    });
  }

  async update(id: string, data: UpdatePermissionDto) {
    const existing = await this.findById(id);
    if (!existing) {
      throw new NotFoundException(`Permiso con ID ${id} no encontrado`);
    }

    // Verificar duplicado si se cambia módulo o acción
    if (data.module || data.action) {
      const duplicate = await this.prisma.permissions.findFirst({
        where: {
          module: data.module || existing.module,
          action: data.action || existing.action,
          id: { not: id },
          deletedAt: null,
        },
      });

      if (duplicate) {
        throw new ConflictException('El permiso ya existe para este módulo y acción');
      }
    }

    return this.prisma.permissions.update({
      where: { id },
      data,
    });
  }

  async softDelete(id: string) {
    const existing = await this.findById(id);
    if (!existing) {
      throw new NotFoundException(`Permiso con ID ${id} no encontrado`);
    }

    return this.prisma.permissions.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async restore(id: string) {
    const existing = await this.findById(id, true);
    if (!existing) {
      throw new NotFoundException(`Permiso con ID ${id} no encontrado`);
    }

    return this.prisma.permissions.update({
      where: { id },
      data: { deletedAt: null },
    });
  }
}
