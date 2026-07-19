import { IsString, IsEmail, IsNotEmpty, MinLength, IsOptional } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  first_name: string;

  @IsString()
  @IsNotEmpty()
  last_name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(6)
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  ci?: string;

  @IsString()
  @IsNotEmpty()
  role_id: string;

  @IsString()
  @IsOptional()
  barcode?: string;

  @IsOptional()
  attendance_enabled?: boolean;

  @IsOptional()
  payment_type?: 'none' | 'hour' | 'day' | 'week' | 'fortnight' | 'month' | 'fixed';

  @IsOptional()
  payment_base?: 'attendance_hours' | 'fixed_amount' | 'mixed';

  @IsOptional()
  hourly_rate?: number;

  @IsOptional()
  fixed_amount?: number;
}

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  first_name?: string;

  @IsString()
  @IsOptional()
  last_name?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @MinLength(6)
  @IsOptional()
  password?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  ci?: string;

  @IsString()
  @IsOptional()
  role_id?: string;

  @IsString()
  @IsOptional()
  barcode?: string;

  @IsOptional()
  attendance_enabled?: boolean;

  @IsOptional()
  payment_type?: 'none' | 'hour' | 'day' | 'week' | 'fortnight' | 'month' | 'fixed';

  @IsOptional()
  payment_base?: 'attendance_hours' | 'fixed_amount' | 'mixed';

  @IsOptional()
  hourly_rate?: number;

  @IsOptional()
  fixed_amount?: number;

  @IsOptional()
  is_active?: boolean;
}

export class LoginDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

export class CreateRoleDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsOptional()
  has_system_access?: boolean;

  @IsOptional()
  attendance_config?: any;

  @IsOptional()
  permissions?: any;
}

export class UpdateRoleDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsOptional()
  has_system_access?: boolean;

  @IsOptional()
  attendance_config?: any;

  @IsOptional()
  permissions?: any;
}
