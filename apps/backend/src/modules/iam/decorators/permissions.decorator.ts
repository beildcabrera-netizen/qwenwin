import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'permissions';

/**
 * Decorador para especificar permisos requeridos en un endpoint
 * @param permissions Lista de permisos requeridos (ej: 'academy:students:read', 'users:create')
 */
export const RequirePermissions = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);

/**
 * Decorador para marcar un endpoint como público (sin autenticación)
 */
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

/**
 * Decorador para obtener el usuario actual desde el request
 */
export const CurrentUser = () => (target: any, key: string, descriptor: PropertyDescriptor) => {
  // Este decorador se usa junto con un interceptor o pipe para extraer el usuario
  return descriptor;
};
