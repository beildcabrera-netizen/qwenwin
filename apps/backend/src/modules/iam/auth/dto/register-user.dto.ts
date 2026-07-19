import { IsNotEmpty, IsString, IsEmail, IsOptional } from 'class-validator';

export class RegisterUserDto {
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

  @IsNotEmpty({ message: 'La contraseña es requerida' })
  @IsString()
  password: string;

  @IsOptional()
  @IsString()
  barcode?: string; // Si no se proporciona, se usa el CI
}
