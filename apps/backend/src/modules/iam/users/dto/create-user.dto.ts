import { IsNotEmpty, IsString, IsOptional, IsBoolean, IsEmail, IsEnum } from 'class-validator';
import { PaymentType, PaymentBase } from '@prisma/client';

export class CreateUserDto {
  @IsNotEmpty({ message: 'El CI es requerido' })
  @IsString()
  ci: string;

  @IsNotEmpty({ message: 'El nombre es requerido' })
  @IsString()
  firstName: string;

  @IsNotEmpty({ message: 'El apellido es requerido' })
  @IsString()
  lastName: string;

  @IsOptional()
  @IsEmail({}, { message: 'Email inválido' })
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  password?: string; // Opcional porque puede ser creado por admin sin contraseña inicial

  @IsOptional()
  @IsString()
  barcode?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  hasSystemAccess?: boolean;

  @IsOptional()
  @IsBoolean()
  hasAttendance?: boolean;

  @IsOptional()
  @IsEnum(PaymentType)
  paymentType?: PaymentType;

  @IsOptional()
  @IsEnum(PaymentBase)
  paymentBase?: PaymentBase;

  @IsOptional()
  roles?: string[]; // IDs de roles a asignar
}
