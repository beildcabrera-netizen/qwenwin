import { IsString, IsNotEmpty, IsNumber, IsBoolean, IsOptional, IsArray, ValidateNested, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class GroupScheduleDto {
  @IsString()
  dayOfWeek: string; // 'MONDAY', 'TUESDAY', etc.

  @IsString()
  startTime: string; // '08:00'

  @IsString()
  endTime: string; // '09:00'
}

export class CreateGroupDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  level: string; // 'BEGINNER', 'INTERMEDIATE', 'ADVANCED'

  @IsNumber()
  @Min(1)
  @IsNotEmpty()
  maxCapacity: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  toleranceMinutes?: number;

  @IsString()
  @IsOptional()
  professorId?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GroupScheduleDto)
  schedules: GroupScheduleDto[];

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateGroupDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  level?: string;

  @IsNumber()
  @Min(1)
  @IsOptional()
  maxCapacity?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  toleranceMinutes?: number;

  @IsString()
  @IsOptional()
  professorId?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GroupScheduleDto)
  schedules?: GroupScheduleDto[];

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class GroupResponseDto {
  id: string;
  name: string;
  description: string | null;
  level: string;
  maxCapacity: number;
  currentEnrollment: number;
  toleranceMinutes: number;
  professorId: string | null;
  isActive: boolean;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
  created_by: string;
  updated_by: string | null;
  schedules: any[];
}
