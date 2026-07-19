import { IsNotEmpty, IsNumber, IsOptional, IsString, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePaymentDto {
  @ApiProperty({ description: 'ID de la inscripción (enrollment)' })
  @IsNotEmpty()
  @IsString()
  enrollmentId: string;

  @ApiProperty({ description: 'Monto base del pago' })
  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @ApiProperty({ description: 'Método de pago', enum: ['cash', 'transfer', 'card', 'qr'] })
  @IsNotEmpty()
  @IsString()
  paymentMethod: 'cash' | 'transfer' | 'card' | 'qr';

  @ApiPropertyOptional({ description: 'Nota o referencia del pago' })
  @IsOptional()
  @IsString()
  note?: string;

  @ApiPropertyOptional({ description: 'Fecha del pago (default: ahora)' })
  @IsOptional()
  @IsDateString()
  paymentDate?: string;
}

export class PaymentResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  enrollmentId: string;

  @ApiProperty()
  studentName: string;

  @ApiProperty()
  originalAmount: number;

  @ApiProperty()
  discount: number;

  @ApiProperty()
  finalAmount: number;

  @ApiProperty()
  paymentMethod: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty({ required: false })
  receiptUrl?: string;
}
