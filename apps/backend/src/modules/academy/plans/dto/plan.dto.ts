import { IsString, IsNotEmpty, IsNumber, IsEnum, IsOptional, IsBoolean, Min } from 'class-validator';

export class CreatePlanDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(['regular', 'special'])
  @IsNotEmpty()
  type: 'regular' | 'special';

  @IsEnum(['monthly', 'quarterly', 'semiannual', 'intensive', 'summer', 'private', 'therapeutic'])
  @IsNotEmpty()
  category: 'monthly' | 'quarterly' | 'semiannual' | 'intensive' | 'summer' | 'private' | 'therapeutic';

  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  price: number;

  @IsNumber()
  @Min(1)
  @IsNotEmpty()
  duration_days: number;

  @IsNumber()
  @Min(1)
  @IsNotEmpty()
  sessions_count: number;

  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}

export class UpdatePlanDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(['regular', 'special'])
  @IsOptional()
  type?: 'regular' | 'special';

  @IsEnum(['monthly', 'quarterly', 'semiannual', 'intensive', 'summer', 'private', 'therapeutic'])
  @IsOptional()
  category?: 'monthly' | 'quarterly' | 'semiannual' | 'intensive' | 'summer' | 'private' | 'therapeutic';

  @IsNumber()
  @Min(0)
  @IsOptional()
  price?: number;

  @IsNumber()
  @Min(1)
  @IsOptional()
  duration_days?: number;

  @IsNumber()
  @Min(1)
  @IsOptional()
  sessions_count?: number;

  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}

export class PlanResponseDto {
  id: string;
  name: string;
  description: string | null;
  type: 'regular' | 'special';
  category: 'monthly' | 'quarterly' | 'semiannual' | 'intensive' | 'summer' | 'private' | 'therapeutic';
  price: number;
  duration_days: number;
  sessions_count: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
  created_by: string;
  updated_by: string | null;
}
