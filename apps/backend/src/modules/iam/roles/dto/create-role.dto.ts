import { IsNotEmpty, IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateRoleDto {
  @IsNotEmpty({ message: 'El nombre del rol es requerido' })
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  accessToSystem?: boolean;

  @IsOptional()
  @IsBoolean()
  hasAttendance?: boolean;

  @IsOptional()
  permissions?: string[]; // IDs de permisos a asignar
}
