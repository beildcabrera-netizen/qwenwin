import { Injectable } from '@nestjs/common';
import { PolicyConfig } from './late-arrival.policy';

/**
 * Política de horas extra
 */
@Injectable()
export class OvertimePolicy {
  apply(hoursWorked: number, hoursExpected: number, config: PolicyConfig): number {
    const overtime = hoursWorked - hoursExpected;

    // Si no hay horas extra, retornar horas trabajadas
    if (overtime <= 0) {
      return hoursWorked;
    }

    // Aplicar política de horas extra
    switch (config.overtimePolicy) {
      case 'none':
        // No paga horas extra - retorna solo las esperadas
        return hoursExpected;

      case 'per_block':
        // Paga horas extra solo si completó el bloque completo
        if (hoursWorked >= hoursExpected) {
          return hoursWorked;
        }
        return hoursExpected;

      case 'capped_hours':
        // Paga horas extra hasta un límite
        const cap = config.overtimeCapHours || 0;
        const maxOvertime = Math.min(overtime, cap);
        return hoursExpected + maxOvertime;

      case 'full':
        // Paga todas las horas extra sin límite
        return hoursWorked;

      default:
        return hoursWorked;
    }
  }
}
