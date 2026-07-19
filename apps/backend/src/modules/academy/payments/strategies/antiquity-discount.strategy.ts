import { Injectable } from '@nestjs/common';
import { DiscountStrategy } from './discount-strategy.interface';
import { DiscountContextData } from './discount.context';

/**
 * Estrategia de descuento por antigüedad del alumno
 * Regla: Más antigüedad = mayor descuento
 * - 6 meses a 1 año: 5%
 * - 1 año a 2 años: 10%
 * - 2 años o más: 15%
 */
@Injectable()
export class AntiquityDiscountStrategy implements DiscountStrategy {
  getName(): string {
    return 'Descuento por Antigüedad';
  }

  canApply(data: DiscountContextData): boolean {
    // Aplica solo si el alumno tiene al menos 6 meses de antigüedad
    return data.antiquityDays >= 180;
  }

  calculate(data: DiscountContextData): number {
    const days = data.antiquityDays;
    let discountPercent = 0;

    if (days >= 730) {
      // 2 años o más: 15%
      discountPercent = 0.15;
    } else if (days >= 365) {
      // 1 año a 2 años: 10%
      discountPercent = 0.10;
    } else if (days >= 180) {
      // 6 meses a 1 año: 5%
      discountPercent = 0.05;
    }

    return data.baseAmount * discountPercent;
  }
}
