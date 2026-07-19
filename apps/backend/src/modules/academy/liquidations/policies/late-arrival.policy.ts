import { Injectable } from '@nestjs/common';

export interface AttendanceBlock {
  expectedStart: Date;
  expectedEnd: Date;
  actualStart?: Date;
  actualEnd?: Date;
}

export interface PolicyConfig {
  lateArrivalPenalty: 'none' | 'prorate' | 'block';
  lateGraceMinutes: number;
  earlyDeparturePenalty: 'none' | 'prorate' | 'block';
  earlyGraceMinutes: number;
  overtimePolicy: 'none' | 'per_block' | 'capped_hours' | 'full';
  overtimeCapHours?: number;
  minimumHoursToPay: number;
}

/**
 * Política de llegada tarde
 */
@Injectable()
export class LateArrivalPolicy {
  apply(block: AttendanceBlock, config: PolicyConfig): AttendanceBlock {
    if (!block.actualStart || !block.expectedStart) {
      return block;
    }

    const diffMinutes = (block.actualStart.getTime() - block.expectedStart.getTime()) / (1000 * 60);

    // Si llegó antes o en la hora esperada, no hay penalización
    if (diffMinutes <= 0) {
      return block;
    }

    // Si está dentro del período de gracia, no hay penalización
    if (diffMinutes <= config.lateGraceMinutes) {
      return block;
    }

    // Aplicar política
    if (config.lateArrivalPenalty === 'block') {
      // Bloquea toda la hora - no se cuenta nada
      return { ...block, actualStart: undefined };
    } else if (config.lateArrivalPenalty === 'prorate') {
      // Prorratea - descuenta los minutos de tarde
      const adjustedStart = new Date(block.actualStart.getTime());
      return { ...block, actualStart: adjustedStart };
    }

    // 'none' - no hace nada
    return block;
  }
}
