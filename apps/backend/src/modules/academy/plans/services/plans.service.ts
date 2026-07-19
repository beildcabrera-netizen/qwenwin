import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PlansRepository } from '../repositories/plans.repository';
import { CreatePlanDto, UpdatePlanDto, PlanResponseDto } from '../dto/plan.dto';

@Injectable()
export class PlansService {
  constructor(private plansRepository: PlansRepository) {}

  async create(createPlanDto: CreatePlanDto, userId: string): Promise<PlanResponseDto> {
    // Validar que no exista un plan con el mismo nombre
    const existingPlans = await this.plansRepository.findAll({ name: createPlanDto.name });
    if (existingPlans.length > 0) {
      throw new BadRequestException('Ya existe un plan con este nombre');
    }

    // Validar duración según categoría
    this.validateDuration(createPlanDto.category, createPlanDto.duration_days);

    return this.plansRepository.create(createPlanDto, userId);
  }

  async findAll(filters?: any): Promise<PlanResponseDto[]> {
    return this.plansRepository.findAll(filters);
  }

  async findOne(id: string): Promise<PlanResponseDto> {
    const plan = await this.plansRepository.findOne(id);
    if (!plan) {
      throw new NotFoundException(`Plan con ID ${id} no encontrado`);
    }
    return plan;
  }

  async update(id: string, updatePlanDto: UpdatePlanDto, userId: string): Promise<PlanResponseDto> {
    // Verificar que el plan existe
    await this.findOne(id);

    // Si cambia el nombre, validar que no exista otro con ese nombre
    if (updatePlanDto.name) {
      const existingPlans = await this.plansRepository.findAll({ 
        name: updatePlanDto.name,
        id: { not: id }
      });
      if (existingPlans.length > 0) {
        throw new BadRequestException('Ya existe un plan con este nombre');
      }
    }

    // Validar duración si cambia la categoría
    if (updatePlanDto.category && updatePlanDto.duration_days) {
      this.validateDuration(updatePlanDto.category, updatePlanDto.duration_days);
    }

    return this.plansRepository.update(id, updatePlanDto, userId);
  }

  async remove(id: string, userId: string): Promise<void> {
    // Verificar que el plan existe
    await this.findOne(id);

    // TODO: Verificar que no haya inscripciones activas con este plan

    await this.plansRepository.softDelete(id, userId);
  }

  async getActivePlans(): Promise<PlanResponseDto[]> {
    return this.plansRepository.findActivePlans();
  }

  private validateDuration(category: string, durationDays: number) {
    const minDurations: Record<string, number> = {
      monthly: 28,
      quarterly: 84,
      semiannual: 168,
      intensive: 7,
      summer: 14,
      private: 1,
      therapeutic: 7,
    };

    if (minDurations[category] && durationDays < minDurations[category]) {
      throw new BadRequestException(
        `La duración mínima para planes ${category} es de ${minDurations[category]} días`
      );
    }
  }
}
