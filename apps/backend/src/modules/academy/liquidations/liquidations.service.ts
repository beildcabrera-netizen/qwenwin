import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { LateArrivalPolicy, PolicyConfig, AttendanceBlock } from '../policies/late-arrival.policy';
import { EarlyDeparturePolicy } from '../policies/early-departure.policy';
import { OvertimePolicy } from '../policies/overtime.policy';

@Injectable()
export class LiquidationsService {
  constructor(
    private prisma: PrismaService,
    private lateArrivalPolicy: LateArrivalPolicy,
    private earlyDeparturePolicy: EarlyDeparturePolicy,
    private overtimePolicy: OvertimePolicy,
  ) {}

  /**
   * Calcular liquidación de un usuario por período
   * Soporta todos los tipos de pago: none, hour, day, week, biweekly, month, fixed
   */
  async calculateLiquidation(
    userId: string,
    startDate: Date,
    endDate: Date,
  ) {
    // Obtener usuario con su configuración de pago y rol
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: {
          include: {
            attendancePolicy: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Si el tipo de pago es 'none', retornar 0
    if (user.paymentType === 'none') {
      return this.buildResponse(user, 0, 0, 0, 0, startDate, endDate);
    }

    // Obtener asistencias del período
    const attendances = await this.prisma.attendance.findMany({
      where: {
        userId,
        entryTime: {
          gte: startDate,
          lte: endDate,
        },
        exitTime: {
          not: null,
        },
      },
      orderBy: {
        entryTime: 'asc',
      },
    });

    // Obtener bloques de horario esperados para este período
    const scheduleBlocks = await this.getExpectedScheduleBlocks(userId, startDate, endDate);

    // Configuración de políticas del rol
    const policyConfig: PolicyConfig = user.role?.attendancePolicy || {
      lateArrivalPenalty: 'none',
      lateGraceMinutes: 15,
      earlyDeparturePenalty: 'none',
      earlyGraceMinutes: 15,
      overtimePolicy: 'none',
      minimumHoursToPay: 0,
    };

    // Calcular horas registradas aplicando políticas
    let totalRegisteredHours = 0;
    let totalExpectedHours = 0;

    for (const attendance of attendances) {
      // Encontrar el bloque esperado correspondiente
      const block = this.findMatchingBlock(attendance, scheduleBlocks);

      if (block) {
        const attendanceBlock: AttendanceBlock = {
          expectedStart: block.expectedStart,
          expectedEnd: block.expectedEnd,
          actualStart: attendance.entryTime,
          actualEnd: attendance.exitTime!,
        };

        // Aplicar política de llegada tarde
        const afterLatePolicy = this.lateArrivalPolicy.apply(attendanceBlock, policyConfig);

        // Aplicar política de salida anticipada
        const afterEarlyPolicy = this.earlyDeparturePolicy.apply(afterLatePolicy, policyConfig);

        // Calcular horas del bloque después de políticas
        if (afterEarlyPolicy.actualStart && afterEarlyPolicy.actualEnd) {
          const hoursWorked = (afterEarlyPolicy.actualEnd.getTime() - afterEarlyPolicy.actualStart.getTime()) / (1000 * 60 * 60);
          const hoursExpected = (afterEarlyPolicy.expectedEnd.getTime() - afterEarlyPolicy.expectedStart.getTime()) / (1000 * 60 * 60);

          // Aplicar política de horas extra
          const hoursToCount = this.overtimePolicy.apply(hoursWorked, hoursExpected, policyConfig);

          totalRegisteredHours += Math.max(0, hoursToCount);
        }

        totalExpectedHours += (block.expectedEnd.getTime() - block.expectedStart.getTime()) / (1000 * 60 * 60);
      }
    }

    // Calcular horas a pagar según tipo de pago
    let hoursToPay = 0;
    let totalAmount = 0;

    switch (user.paymentType) {
      case 'hour':
        // Pago por hora registrada con políticas aplicadas
        hoursToPay = totalRegisteredHours;
        break;

      case 'day':
        // Pago por día (asumiendo 8 horas por día de asistencia)
        const daysWorked = attendances.length;
        hoursToPay = daysWorked * 8;
        break;

      case 'week':
        // Pago semanal fijo si cumplió con la semana
        hoursToPay = totalExpectedHours;
        break;

      case 'biweekly':
        // Pago quincenal fijo
        hoursToPay = totalExpectedHours;
        break;

      case 'month':
        // Pago mensual fijo
        hoursToPay = totalExpectedHours;
        break;

      case 'fixed':
        // Monto fijo independiente de horas
        hoursToPay = 0; // Las horas son solo control
        break;

      default:
        hoursToPay = 0;
    }

    // Aplicar mínimo de horas para pagar
    if (policyConfig.minimumHoursToPay > 0 && hoursToPay < policyConfig.minimumHoursToPay) {
      hoursToPay = 0;
    }

    // Calcular monto total
    if (user.paymentType === 'fixed' || user.paymentBase === 'fixed_amount') {
      totalAmount = user.fixedPaymentAmount || 0;
    } else {
      totalAmount = hoursToPay * (user.hourlyRate || 0);
    }

    return this.buildResponse(user, totalRegisteredHours, totalExpectedHours, hoursToPay, totalAmount, startDate, endDate);
  }

  /**
   * Obtener bloques de horario esperados para un usuario en un período
   */
  private async getExpectedScheduleBlocks(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<Array<{ date: Date; expectedStart: Date; expectedEnd: Date }>> {
    const blocks = await this.prisma.userScheduleBlock.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        date: 'asc',
      },
    });

    return blocks.map((b) => ({
      date: b.date,
      expectedStart: b.startTime,
      expectedEnd: b.endTime,
    }));
  }

  /**
   * Encontrar el bloque esperado que corresponde a una asistencia
   */
  private findMatchingBlock(
    attendance: any,
    blocks: Array<{ date: Date; expectedStart: Date; expectedEnd: Date }>,
  ) {
    const attendanceDate = new Date(attendance.entryTime.toISOString().split('T')[0]);

    return blocks.find((block) => {
      const blockDate = new Date(block.date.toISOString().split('T')[0]);
      return blockDate.getTime() === attendanceDate.getTime();
    });
  }

  /**
   * Construir respuesta estandarizada
   */
  private buildResponse(
    user: any,
    registeredHours: number,
    expectedHours: number,
    hoursToPay: number,
    totalAmount: number,
    startDate: Date,
    endDate: Date,
  ) {
    return {
      userId: user.id,
      userName: `${user.firstName} ${user.lastName}`,
      paymentType: user.paymentType,
      paymentBase: user.paymentBase,
      registeredHours: Math.round(registeredHours * 100) / 100,
      expectedHours: Math.round(expectedHours * 100) / 100,
      hoursToPay: Math.round(hoursToPay * 100) / 100,
      hourlyRate: user.hourlyRate,
      fixedAmount: user.fixedPaymentAmount,
      totalAmount: Math.round(totalAmount * 100) / 100,
      periodStart: startDate,
      periodEnd: endDate,
      calculatedAt: new Date(),
    };
  }
}
