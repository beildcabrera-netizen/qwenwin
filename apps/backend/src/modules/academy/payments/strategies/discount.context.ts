import { Injectable } from '@nestjs/common';
import { DiscountStrategy } from './discount-strategy.interface';

export interface DiscountContextData {
  enrollmentDate: Date;
  paymentDate: Date;
  baseAmount: number;
  antiquityDays: number;
}

@Injectable()
export class DiscountContext {
  private strategies: DiscountStrategy[] = [];

  addStrategy(strategy: DiscountStrategy): void {
    this.strategies.push(strategy);
  }

  calculateDiscount(data: DiscountContextData): number {
    let totalDiscount = 0;

    for (const strategy of this.strategies) {
      if (strategy.canApply(data)) {
        totalDiscount += strategy.calculate(data);
      }
    }

    // El descuento no puede superar el monto base
    return Math.min(totalDiscount, data.baseAmount);
  }

  getDiscountBreakdown(data: DiscountContextData): Array<{ strategy: string; discount: number }> {
    const breakdown: Array<{ strategy: string; discount: number }> = [];

    for (const strategy of this.strategies) {
      if (strategy.canApply(data)) {
        const discount = strategy.calculate(data);
        if (discount > 0) {
          breakdown.push({
            strategy: strategy.getName(),
            discount,
          });
        }
      }
    }

    return breakdown;
  }
}
