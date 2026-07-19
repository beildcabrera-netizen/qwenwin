import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Si no se requieren permisos específicos, permitir acceso
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization?.split(' ')[1];

    if (!token) {
      throw new ForbiddenException('Token de acceso no proporcionado');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token);
      const userPermissions = payload.permissions || [];

      // Verificar si el usuario tiene al menos uno de los permisos requeridos
      const hasPermission = requiredPermissions.some((permission) =>
        userPermissions.includes(permission),
      );

      if (!hasPermission) {
        throw new ForbiddenException(
          `Acceso denegado. Se requiere uno de los siguientes permisos: ${requiredPermissions.join(', ')}`,
        );
      }

      // Adjuntar información del usuario al request
      request.user = {
        id: payload.sub,
        ci: payload.ci,
        email: payload.email,
        firstName: payload.firstName,
        lastName: payload.lastName,
        roles: payload.roles,
        permissions: payload.permissions,
        hasSystemAccess: payload.hasSystemAccess,
      };

      return true;
    } catch (error) {
      throw new ForbiddenException('Token inválido o expirado');
    }
  }
}
