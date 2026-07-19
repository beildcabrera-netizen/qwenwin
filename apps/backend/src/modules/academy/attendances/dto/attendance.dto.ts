import { IsString, IsNotEmpty, IsOptional, IsDateString, IsEnum } from 'class-validator';

export class CreateAttendanceDto {
  @IsString()
  @IsNotEmpty()
  studentId: string;

  @IsString()
  @IsNotEmpty()
  enrollmentId: string;

  @IsDateString()
  @IsOptional()
  checkIn?: string;

  @IsDateString()
  @IsOptional()
  checkOut?: string;

  @IsString()
  @IsOptional()
  method?: 'barcode' | 'manual' | 'qr';
}

export class UpdateAttendanceDto {
  @IsDateString()
  @IsOptional()
  checkOut?: string;

  @IsString()
  @IsOptional()
  method?: 'barcode' | 'manual' | 'qr';
}

export class AttendanceResponseDto {
  id: string;
  studentId: string;
  enrollmentId: string;
  checkIn: Date;
  checkOut: Date | null;
  duration: number | null;
  status: 'checked_in' | 'checked_out' | 'absent';
  method: 'barcode' | 'manual' | 'qr';
  isWithinSchedule: boolean;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
  student: any;
  enrollment: any;
}
