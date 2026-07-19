import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsDateString } from 'class-validator';

export class CreateEnrollmentDto {
  @IsString()
  @IsNotEmpty()
  studentId: string;

  @IsString()
  @IsNotEmpty()
  groupId: string;

  @IsString()
  @IsNotEmpty()
  planId: string;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateEnrollmentDto {
  @IsString()
  @IsOptional()
  groupId?: string;

  @IsString()
  @IsOptional()
  planId?: string;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class EnrollmentResponseDto {
  id: string;
  studentId: string;
  groupId: string;
  planId: string;
  startDate: Date;
  endDate: Date | null;
  isActive: boolean;
  status: 'active' | 'expired' | 'cancelled' | 'frozen';
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
  created_by: string;
  updated_by: string | null;
  student: any;
  group: any;
  plan: any;
}
