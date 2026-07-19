import { IsString, IsNotEmpty, IsEmail, IsOptional, IsBoolean, IsDateString, ValidateNested, IsObject } from 'class-validator';
import { Type } from 'class-transformer';

export class EmergencyContactDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  relationship: string;

  @IsString()
  @IsNotEmpty()
  phone: string;
}

export class CreateStudentDto {
  @IsString()
  @IsNotEmpty()
  ci: string; // Cédula de identidad

  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsDateString()
  @IsNotEmpty()
  dateOfBirth: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  gender?: string;

  @IsString()
  @IsOptional()
  bloodType?: string;

  @IsString()
  @IsOptional()
  medicalConditions?: string;

  @IsString()
  @IsNotEmpty()
  guardianFirstName: string;

  @IsString()
  @IsNotEmpty()
  guardianLastName: string;

  @IsString()
  @IsNotEmpty()
  guardianPhone: string;

  @IsEmail()
  @IsOptional()
  guardianEmail?: string;

  @IsString()
  @IsOptional()
  guardianRelationship?: string;

  @ValidateNested()
  @Type(() => EmergencyContactDto)
  @IsOptional()
  emergencyContact?: EmergencyContactDto;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateStudentDto {
  @IsString()
  @IsOptional()
  ci?: string;

  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsDateString()
  @IsOptional()
  dateOfBirth?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  gender?: string;

  @IsString()
  @IsOptional()
  bloodType?: string;

  @IsString()
  @IsOptional()
  medicalConditions?: string;

  @IsString()
  @IsOptional()
  guardianFirstName?: string;

  @IsString()
  @IsOptional()
  guardianLastName?: string;

  @IsString()
  @IsOptional()
  guardianPhone?: string;

  @IsEmail()
  @IsOptional()
  guardianEmail?: string;

  @IsString()
  @IsOptional()
  guardianRelationship?: string;

  @IsObject()
  @ValidateNested()
  @Type(() => EmergencyContactDto)
  @IsOptional()
  emergencyContact?: EmergencyContactDto;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class StudentResponseDto {
  id: string;
  ci: string;
  firstName: string;
  lastName: string;
  fullName: string;
  dateOfBirth: string;
  age: number;
  email: string | null;
  phone: string;
  address: string | null;
  gender: string | null;
  bloodType: string | null;
  medicalConditions: string | null;
  guardianFirstName: string;
  guardianLastName: string;
  guardianPhone: string;
  guardianEmail: string | null;
  guardianRelationship: string | null;
  emergencyContact: any | null;
  isActive: boolean;
  barcode: string;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
  created_by: string;
  updated_by: string | null;
}
