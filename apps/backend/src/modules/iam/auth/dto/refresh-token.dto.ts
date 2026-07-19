import { IsNotEmpty, IsString, IsOptional, IsBoolean } from 'class-validator';

export class RefreshTokenDto {
  @IsNotEmpty({ message: 'El refresh token es requerido' })
  @IsString()
  refreshToken: string;
}
