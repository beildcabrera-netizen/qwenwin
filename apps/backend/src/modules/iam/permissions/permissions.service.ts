import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PermissionsRepository } from './repositories/permissions.repository';
import { CreatePermissionDto, UpdatePermissionDto } from './dto/create-permission.dto';

@Injectable()
export class PermissionsService {
  constructor(private permissionsRepository: PermissionsRepository) {}

  async create(createPermissionDto: CreatePermissionDto) {
    return this.permissionsRepository.create(createPermissionDto);
  }

  async findAll(includeDeleted = false) {
    return this.permissionsRepository.findAll(includeDeleted);
  }

  async findOne(id: string) {
    const permission = await this.permissionsRepository.findById(id);
    if (!permission) {
      throw new NotFoundException(`Permiso con ID ${id} no encontrado`);
    }
    return permission;
  }

  async findByModule(module: string) {
    return this.permissionsRepository.findByModule(module);
  }

  async update(id: string, updatePermissionDto: UpdatePermissionDto) {
    return this.permissionsRepository.update(id, updatePermissionDto);
  }

  async remove(id: string) {
    return this.permissionsRepository.softDelete(id);
  }

  async restore(id: string) {
    return this.permissionsRepository.restore(id);
  }

  async getAvailableModules() {
    const modules = [
      { value: 'academy:students', label: 'Academia - Alumnos' },
      { value: 'academy:groups', label: 'Academia - Grupos' },
      { value: 'academy:plans', label: 'Academia - Planes' },
      { value: 'academy:enrollments', label: 'Academia - Inscripciones' },
      { value: 'academy:payments', label: 'Academia - Pagos' },
      { value: 'academy:attendance', label: 'Academia - Asistencia' },
      { value: 'academy:turns', label: 'Academia - Turnos' },
      { value: 'academy:reports', label: 'Academia - Reportes' },
      { value: 'store:products', label: 'Tienda - Productos' },
      { value: 'store:sales', label: 'Tienda - Ventas' },
      { value: 'store:inventory', label: 'Tienda - Inventario' },
      { value: 'users', label: 'Usuarios' },
      { value: 'roles', label: 'Roles' },
      { value: 'permissions', label: 'Permisos' },
      { value: 'settings', label: 'Configuración' },
      { value: 'dashboard', label: 'Dashboard' },
      { value: 'access:control', label: 'Control de Acceso' },
    ];
    return modules;
  }

  async getAvailableActions() {
    const actions = [
      { value: 'create', label: 'Crear' },
      { value: 'read', label: 'Leer' },
      { value: 'update', label: 'Actualizar' },
      { value: 'delete', label: 'Eliminar' },
      { value: 'export', label: 'Exportar' },
      { value: 'approve', label: 'Aprobar' },
    ];
    return actions;
  }
}
