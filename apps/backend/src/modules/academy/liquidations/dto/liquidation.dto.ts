import { IsNotEmpty, IsString, IsDateString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CalculateLiquidationDto {
  @ApiProperty({ description: 'ID del usuario (profesor/personal)' })
  @IsNotEmpty()
  @IsString()
  userId: string;

  @ApiProperty({ description: 'Fecha de inicio del período' })
  @IsNotEmpty()
  @IsDateString()
  startDate: string;

  @ApiProperty({ description: 'Fecha de fin del período' })
  @IsNotEmpty()
  @IsDateString()
  endDate: string;
}

export class LiquidationResponseDto {
  @ApiProperty()
  userId: string;

  @ApiProperty()
  userName: string;

  @ApiProperty()
  paymentType: string;

  @ApiProperty()
  paymentBase: string;

  @ApiProperty()
  registeredHours: number;

  @ApiProperty()
  expectedHours: number;

  @ApiProperty()
  hoursToPay: number;

  @ApiProperty()
  hourlyRate?: number;

  @ApiProperty()
  fixedAmount?: number;

  @ApiProperty()
  totalAmount: number;

  @ApiProperty()
  periodStart: Date;

  @ApiProperty()
  periodEnd: Date;

  @ApiProperty()
  calculatedAt: Date;
}
