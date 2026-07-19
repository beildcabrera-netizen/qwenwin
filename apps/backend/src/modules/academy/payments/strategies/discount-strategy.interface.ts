import { DiscountContextData } from './discount.context';

export interface DiscountStrategy {
  getName(): string;
  canApply(data: DiscountContextData): boolean;
  calculate(data: DiscountContextData): number;
}
