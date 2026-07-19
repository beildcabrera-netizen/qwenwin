import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { EnrollmentsRepository } from '../repositories/enrollments.repository';
import { CreateEnrollmentDto, UpdateEnrollmentDto, EnrollmentResponseDto } from '../dto/enrollment.dto';

@Injectable()
export class EnrollmentsService {
  constructor(private enrollmentsRepository: EnrollmentsRepository) {}

  async create(createEnrollmentDto: CreateEnrollmentDto, userId: string): Promise<EnrollmentResponseDto> {
    // Verificar que el estudiante existe
    const student = await this.checkStudentExists(createEnrollmentDto.studentId);

    // Verificar que el grupo existe y tiene cupo
    const groupCapacity = await this.enrollmentsRepository.getGroupCapacity(createEnrollmentDto.groupId);
    if (!groupCapacity) {
      throw new NotFoundException('Grupo no encontrado');
    }
    if (groupCapacity.isFull) {
      throw new BadRequestException('El grupo está lleno. No hay cupos disponibles.');
    }

    // Verificar que el plan existe
    const plan = await this.checkPlanExists(createEnrollmentDto.planId);

    // Verificar conflictos de horario
    const hasConflict = await this.enrollmentsRepository.checkScheduleConflict(
      createEnrollmentDto.studentId,
      createEnrollmentDto.groupId,
    );
    if (hasConflict) {
      throw new BadRequestException('El estudiante ya tiene una inscripción en un grupo con horario superpuesto.');
    }

    // Calcular fechas
    const startDate = createEnrollmentDto.startDate ? new Date(createEnrollmentDto.startDate) : new Date();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + plan.durationDays);

    // Crear inscripción
    return this.enrollmentsRepository.create(
      {
        ...createEnrollmentDto,
        startDate,
        endDate,
      },
      userId,
    ) as any;
  }

  async findAll(filters?: any): Promise<EnrollmentResponseDto[]> {
    return this.enrollmentsRepository.findAll(filters) as any;
  }

  async findOne(id: string): Promise<EnrollmentResponseDto> {
    const enrollment = await this.enrollmentsRepository.findOne(id);
    if (!enrollment) {
      throw new NotFoundException(`Inscripción con ID ${id} no encontrada`);
    }
    return this.mapEnrollmentResponse(enrollment);
  }

  async findByStudentId(studentId: string): Promise<EnrollmentResponseDto[]> {
    return this.enrollmentsRepository.findByStudentId(studentId) as any;
  }

  async findActiveByStudentId(studentId: string): Promise<EnrollmentResponseDto | null> {
    const enrollment = await this.enrollmentsRepository.findActiveEnrollmentByStudent(studentId);
    if (!enrollment) return null;
    return this.mapEnrollmentResponse(enrollment);
  }

  async update(id: string, updateEnrollmentDto: UpdateEnrollmentDto, userId: string): Promise<EnrollmentResponseDto> {
    // Verificar que la inscripción existe
    const currentEnrollment = await this.findOne(id);

    // Si cambia el grupo, verificar cupo y conflictos
    if (updateEnrollmentDto.groupId && updateEnrollmentDto.groupId !== currentEnrollment.groupId) {
      const groupCapacity = await this.enrollmentsRepository.getGroupCapacity(updateEnrollmentDto.groupId);
      if (!groupCapacity) {
        throw new NotFoundException('Grupo no encontrado');
      }
      if (groupCapacity.isFull) {
        throw new BadRequestException('El grupo está lleno. No hay cupos disponibles.');
      }

      const hasConflict = await this.enrollmentsRepository.checkScheduleConflict(
        currentEnrollment.studentId,
        updateEnrollmentDto.groupId,
        id,
      );
      if (hasConflict) {
        throw new BadRequestException('El estudiante ya tiene una inscripción en un grupo con horario superpuesto.');
      }
    }

    // Si cambia el plan, recalcular fecha de vencimiento
    const updateData: any = { ...updateEnrollmentDto };
    if (updateEnrollmentDto.planId) {
      const newPlan = await this.checkPlanExists(updateEnrollmentDto.planId);
      // TODO: Implementar prorrateo si es necesario
    }

    return this.enrollmentsRepository.update(id, updateData, userId) as any;
  }

  async remove(id: string, userId: string): Promise<void> {
    // Verificar que la inscripción existe
    await this.findOne(id);

    // TODO: Verificar que no haya pagos pendientes

    await this.enrollmentsRepository.softDelete(id, userId);
  }

  async freeze(id: string, userId: string, reason?: string): Promise<EnrollmentResponseDto> {
    const enrollment = await this.findOne(id);
    
    if (enrollment.status === 'frozen') {
      throw new BadRequestException('La inscripción ya está congelada');
    }

    // TODO: Registrar la congelación con motivo y días

    return this.enrollmentsRepository.update(id, { isActive: false }, userId) as any;
  }

  async unfreeze(id: string, userId: string): Promise<EnrollmentResponseDto> {
    const enrollment = await this.findOne(id);
    
    if (enrollment.status !== 'frozen') {
      throw new BadRequestException('La inscripción no está congelada');
    }

    // TODO: Recalcular fecha de vencimiento según días consumidos

    return this.enrollmentsRepository.update(id, { isActive: true }, userId) as any;
  }

  private async checkStudentExists(studentId: string) {
    // TODO: Implementar verificación real cuando esté el módulo de estudiantes
    return { id: studentId };
  }

  private async checkPlanExists(planId: string) {
    // TODO: Implementar verificación real cuando esté el módulo de planes
    return { id: planId, durationDays: 30 };
  }

  private mapEnrollmentResponse(enrollment: any): EnrollmentResponseDto {
    let status: 'active' | 'expired' | 'cancelled' | 'frozen' = 'active';
    
    if (!enrollment.isActive) {
      status = 'cancelled';
    } else if (enrollment.endDate && new Date(enrollment.endDate) < new Date()) {
      status = 'expired';
    }

    return {
      ...enrollment,
      status,
    };
  }
}
