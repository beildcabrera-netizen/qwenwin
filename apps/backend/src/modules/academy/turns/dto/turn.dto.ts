import { IsNotEmpty, IsNumber, IsOptional, IsString, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class OpenTurnDto {
  @ApiProperty({ description: 'Monto inicial en caja' })
  @IsNotEmpty()
  @IsNumber()
  initialAmount: number;

  @ApiPropertyOptional({ description: 'Nota de apertura' })
  @IsOptional()
  @IsString()
  note?: string;
}

export class TurnPaymentDto {
  @ApiProperty({ description: 'ID del pago asociado' })
  @IsNotEmpty()
  @IsString()
  paymentId: string;

  @ApiProperty({ description: 'Monto recibido' })
  @IsNotEmpty()
  @IsNumber()
  amount: number;
}

export class TurnWithdrawalDto {
  @ApiProperty({ description: 'Monto a retirar' })
  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @ApiProperty({ description: 'Motivo del retiro' })
  @IsNotEmpty()
  @IsString()
  reason: string;
}

export class CloseTurnDto {
  @ApiProperty({ description: 'Monto físico contado en caja' })
  @IsNotEmpty()
  @IsNumber()
  physicalAmount: number;

  @ApiPropertyOptional({ description: 'Observaciones del cierre' })
  @IsOptional()
  @IsString()
  observations?: string;
}

export class TurnResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  initialAmount: number;

  @ApiProperty()
  totalPayments: number;

  @ApiProperty()
  totalWithdrawals: number;

  @ApiProperty()
  expectedAmount: number;

  @ApiProperty({ required: false })
  physicalAmount?: number;

  @ApiProperty({ required: false })
  discrepancy?: number;

  @ApiProperty()
  openedAt: Date;

  @ApiProperty({ required: false })
  closedAt?: Date;

  @ApiProperty()
  openedBy: string;

  @ApiProperty({ required: false })
  closedBy?: string;
}
