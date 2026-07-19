import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

  async create(createRoleDto: CreateRoleDto) {
    // Verificar si el nombre ya existe
    const existing = await this.prisma.role.findFirst({
      where: { name: createRoleDto.name, deletedAt: null },
    });

    if (existing) {
      throw new ConflictException(`El rol "${createRoleDto.name}" ya existe`);
    }

    const role = await this.prisma.role.create({
      data: {
        name: createRoleDto.name,
        description: createRoleDto.description,
        accessToSystem: createRoleDto.accessToSystem ?? false,
        hasAttendance: createRoleDto.hasAttendance ?? false,
      },
    });

    // Asignar permisos si se proporcionan
    if (createRoleDto.permissions && createRoleDto.permissions.length > 0) {
      for (const permissionId of createRoleDto.permissions) {
        await this.prisma.rolePermission.create({
          data: { roleId: role.id, permissionId, grantedBy: 'system' },
        });
      }
    }

    return this.findOne(role.id);
  }

  async findAll() {
    return this.prisma.role.findMany({
      where: { deletedAt: null },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
        policy: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
        policy: true,
        users: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                ci: true,
              },
            },
          },
        },
      },
    });

    if (!role || role.deletedAt) {
      throw new NotFoundException(`Rol con ID ${id} no encontrado`);
    }

    return role;
  }

  async update(id: string, updateRoleDto: UpdateRoleDto) {
    const existing = await this.findOne(id);

    // Verificar nombre duplicado si se cambia
    if (updateRoleDto.name && updateRoleDto.name !== existing.name) {
      const duplicate = await this.prisma.role.findFirst({
        where: { name: updateRoleDto.name, deletedAt: null },
      });

      if (duplicate) {
        throw new ConflictException(`El rol "${updateRoleDto.name}" ya existe`);
      }
    }

    return this.prisma.role.update({
      where: { id },
      data: updateRoleDto,
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
        policy: true,
      },
    });
  }

  async remove(id: string) {
    const role = await this.findOne(id);

    // Verificar si tiene usuarios activos
    const usersCount = await this.prisma.userRole.count({
      where: { roleId: id },
    });

    if (usersCount > 0) {
      throw new BadRequestException(
        `No se puede eliminar el rol porque tiene ${usersCount} usuario(s) asignado(s). Reasigna o elimina los usuarios primero.`,
      );
    }

    return this.prisma.role.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async assignPermission(roleId: string, permissionId: string) {
    const role = await this.findOne(roleId);

    const existing = await this.prisma.rolePermission.findUnique({
      where: { roleId_permissionId: { roleId, permissionId } },
    });

    if (existing) {
      throw new ConflictException('El permiso ya está asignado a este rol');
    }

    await this.prisma.rolePermission.create({
      data: { roleId, permissionId, grantedBy: 'system' },
    });

    return this.findOne(roleId);
  }

  async removePermission(roleId: string, permissionId: string) {
    await this.prisma.rolePermission.delete({
      where: { roleId_permissionId: { roleId, permissionId } },
    });

    return this.findOne(roleId);
  }
}
