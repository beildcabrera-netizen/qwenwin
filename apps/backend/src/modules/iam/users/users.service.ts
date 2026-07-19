import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersRepository } from './repositories/users.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private usersRepository: UsersRepository) {}

  async create(createUserDto: CreateUserDto) {
    // Verificar duplicados
    const existingByCi = await this.usersRepository.findByCi(createUserDto.ci);
    if (existingByCi) {
      throw new ConflictException('El CI ya está registrado');
    }

    if (createUserDto.email) {
      const existingByEmail = await this.usersRepository.findByEmail(createUserDto.email);
      if (existingByEmail) {
        throw new ConflictException('El email ya está registrado');
      }
    }

    // Preparar datos
    const userData: any = {
      ci: createUserDto.ci,
      firstName: createUserDto.firstName,
      lastName: createUserDto.lastName,
      email: createUserDto.email,
      phone: createUserDto.phone,
      barcode: createUserDto.barcode || createUserDto.ci,
      isActive: createUserDto.isActive ?? true,
      hasSystemAccess: createUserDto.hasSystemAccess ?? false,
      hasAttendance: createUserDto.hasAttendance ?? false,
      paymentType: createUserDto.paymentType || 'NONE',
      paymentBase: createUserDto.paymentBase || 'ATTENDANCE_HOURS',
    };

    // Hashear contraseña si se proporciona
    if (createUserDto.password) {
      userData.password = await bcrypt.hash(createUserDto.password, 10);
    } else {
      // Contraseña temporal por defecto
      userData.password = await bcrypt.hash('123456', 10);
    }

    // Crear usuario
    const user = await this.usersRepository.create(userData);

    // Asignar roles si se proporcionan
    if (createUserDto.roles && createUserDto.roles.length > 0) {
      for (const roleId of createUserDto.roles) {
        await this.usersRepository.assignRole(user.id, roleId);
      }
    }

    return this.findOne(user.id);
  }

  async findAll(includeDeleted = false) {
    return this.usersRepository.findAll(includeDeleted);
  }

  async findOne(id: string) {
    const user = await this.usersRepository.findById(id, true);
    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const existing = await this.usersRepository.findById(id);
    if (!existing) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    // Verificar CI duplicado si se cambia
    if (updateUserDto.ci && updateUserDto.ci !== existing.ci) {
      const duplicate = await this.usersRepository.findByCi(updateUserDto.ci);
      if (duplicate && duplicate.id !== id) {
        throw new ConflictException('El CI ya está en uso por otro usuario');
      }
    }

    // Hashear nueva contraseña si se proporciona
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    return this.usersRepository.update(id, updateUserDto);
  }

  async remove(id: string) {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    return this.usersRepository.softDelete(id);
  }

  async assignRole(userId: string, roleId: string) {
    const user = await this.usersRepository.findById(userId);
    if (!user) {
      throw new NotFoundException(`Usuario con ID ${userId} no encontrado`);
    }

    await this.usersRepository.assignRole(userId, roleId);
    return this.findOne(userId);
  }

  async removeRole(userId: string, roleId: string) {
    await this.usersRepository.removeRole(userId, roleId);
    return this.findOne(userId);
  }

  async getAttendanceLogs(userId: string, startDate?: Date, endDate?: Date) {
    const user = await this.usersRepository.findById(userId);
    if (!user) {
      throw new NotFoundException(`Usuario con ID ${userId} no encontrado`);
    }

    return this.usersRepository.getAttendanceLogs(userId, startDate, endDate);
  }
}
