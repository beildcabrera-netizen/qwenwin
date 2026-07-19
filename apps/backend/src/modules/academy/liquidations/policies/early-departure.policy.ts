import { Injectable } from '@nestjs/common';
import { AttendanceBlock, PolicyConfig } from './late-arrival.policy';

/**
 * Política de salida anticipada
 */
@Injectable()
export class EarlyDeparturePolicy {
  apply(block: AttendanceBlock, config: PolicyConfig): AttendanceBlock {
    if (!block.actualEnd || !block.expectedEnd) {
      return block;
    }

    const diffMinutes = (block.expectedEnd.getTime() - block.actualEnd.getTime()) / (1000 * 60);

    // Si se quedó hasta o después de la hora esperada, no hay penalización
    if (diffMinutes <= 0) {
      return block;
    }

    // Si está dentro del período de gracia, no hay penalización
    if (diffMinutes <= config.earlyGraceMinutes) {
      return block;
    }

    // Aplicar política
    if (config.earlyDeparturePenalty === 'block') {
      // Bloquea toda la hora - no se cuenta nada
      return { ...block, actualEnd: undefined };
    } else if (config.earlyDeparturePenalty === 'prorate') {
      // Prorratea - descuenta los minutos anticipados
      return { ...block, actualEnd: block.actualEnd };
    }

    // 'none' - no hace nada
    return block;
  }
}
