import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { GroupsRepository } from '../repositories/groups.repository';
import { CreateGroupDto, UpdateGroupDto, GroupResponseDto } from '../dto/group.dto';

@Injectable()
export class GroupsService {
  constructor(private groupsRepository: GroupsRepository) {}

  async create(createGroupDto: CreateGroupDto, userId: string): Promise<GroupResponseDto> {
    // Validar que no exista un grupo con el mismo nombre
    const existingGroups = await this.groupsRepository.findAll({ name: createGroupDto.name });
    if (existingGroups.length > 0) {
      throw new BadRequestException('Ya existe un grupo con este nombre');
    }

    // Validar horarios
    this.validateSchedules(createGroupDto.schedules);

    return this.groupsRepository.create(createGroupDto as any, userId);
  }

  async findAll(filters?: any): Promise<GroupResponseDto[]> {
    return this.groupsRepository.findAll(filters);
  }

  async findOne(id: string): Promise<GroupResponseDto> {
    const group = await this.groupsRepository.findOne(id);
    if (!group) {
      throw new NotFoundException(`Grupo con ID ${id} no encontrado`);
    }
    return group as any;
  }

  async update(id: string, updateGroupDto: UpdateGroupDto, userId: string): Promise<GroupResponseDto> {
    // Verificar que el grupo existe
    await this.findOne(id);

    // Si cambia el nombre, validar que no exista otro con ese nombre
    if (updateGroupDto.name) {
      const existingGroups = await this.groupsRepository.findAll({ 
        name: updateGroupDto.name,
        id: { not: id }
      });
      if (existingGroups.length > 0) {
        throw new BadRequestException('Ya existe un grupo con este nombre');
      }
    }

    // Validar horarios si se actualizan
    if (updateGroupDto.schedules) {
      this.validateSchedules(updateGroupDto.schedules);
    }

    return this.groupsRepository.update(id, updateGroupDto as any, userId);
  }

  async remove(id: string, userId: string): Promise<void> {
    // Verificar que el grupo existe
    await this.findOne(id);

    // TODO: Verificar que no haya inscripciones activas en este grupo

    await this.groupsRepository.softDelete(id, userId);
  }

  async getActiveGroups(): Promise<GroupResponseDto[]> {
    return this.groupsRepository.findActiveGroups() as any;
  }

  async getGroupOccupancy(groupId: string) {
    const occupancy = await this.groupsRepository.getGroupOccupancy(groupId);
    if (!occupancy) {
      throw new NotFoundException(`Grupo con ID ${groupId} no encontrado`);
    }
    return occupancy;
  }

  private validateSchedules(schedules: any[]) {
    if (!schedules || schedules.length === 0) {
      throw new BadRequestException('El grupo debe tener al menos un horario asignado');
    }

    const daysOfWeek = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

    for (const schedule of schedules) {
      if (!daysOfWeek.includes(schedule.dayOfWeek)) {
        throw new BadRequestException(`Día de la semana inválido: ${schedule.dayOfWeek}`);
      }

      // Validar formato de hora (HH:MM)
      const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(schedule.startTime) || !timeRegex.test(schedule.endTime)) {
        throw new BadRequestException('Formato de hora inválido. Use HH:MM (ej: 08:00)');
      }

      // Validar que la hora de inicio sea menor a la de fin
      if (schedule.startTime >= schedule.endTime) {
        throw new BadRequestException('La hora de inicio debe ser menor a la hora de fin');
      }
    }
  }
}
