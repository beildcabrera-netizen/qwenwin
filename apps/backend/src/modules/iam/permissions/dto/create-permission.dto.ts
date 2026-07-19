import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';

export enum PermissionAction {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  EXPORT = 'export',
  APPROVE = 'approve',
}

export enum PermissionModule {
  ACADEMY_STUDENTS = 'academy:students',
  ACADEMY_GROUPS = 'academy:groups',
  ACADEMY_PLANS = 'academy:plans',
  ACADEMY_ENROLLMENTS = 'academy:enrollments',
  ACADEMY_PAYMENTS = 'academy:payments',
  ACADEMY_ATTENDANCE = 'academy:attendance',
  ACADEMY_TURNS = 'academy:turns',
  ACADEMY_REPORTS = 'academy:reports',
  STORE_PRODUCTS = 'store:products',
  STORE_SALES = 'store:sales',
  STORE_INVENTORY = 'store:inventory',
  USERS = 'users',
  ROLES = 'roles',
  PERMISSIONS = 'permissions',
  SETTINGS = 'settings',
  DASHBOARD = 'dashboard',
  ACCESS_CONTROL = 'access:control',
}

export class CreatePermissionDto {
  @IsEnum(PermissionModule)
  @IsNotEmpty()
  module: PermissionModule;

  @IsEnum(PermissionAction)
  @IsNotEmpty()
  action: PermissionAction;

  @IsString()
  @IsOptional()
  description?: string;
}

export class UpdatePermissionDto {
  @IsEnum(PermissionModule)
  @IsOptional()
  module?: PermissionModule;

  @IsEnum(PermissionAction)
  @IsOptional()
  action?: PermissionAction;

  @IsString()
  @IsOptional()
  description?: string;
}

export class AssignPermissionToRoleDto {
  @IsString()
  @IsNotEmpty()
  roleId: string;

  @IsString()
  @IsNotEmpty()
  permissionId: string;
}
