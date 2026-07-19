import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterUserDto } from './dto/register-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    // Buscar usuario por email o CI
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: loginDto.identifier },
          { ci: loginDto.identifier },
        ],
      },
      include: {
        roles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Verificar contraseña
    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Construir payload
    const roles = user.roles.map((ur) => ur.role.name);
    const permissions = user.roles.flatMap((ur) =>
      ur.role.permissions.map((rp) => `${rp.permission.module}:${rp.permission.action}`),
    );

    const payload = {
      sub: user.id,
      ci: user.ci,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      roles,
      permissions,
      hasSystemAccess: user.hasSystemAccess,
    };

    const accessToken = await this.jwtService.signAsync(payload);
    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: '7d',
    });

    return {
      user: {
        id: user.id,
        ci: user.ci,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        roles,
        permissions,
        hasSystemAccess: user.hasSystemAccess,
      },
      accessToken,
      refreshToken,
      expiresIn: 86400, // 24 horas en segundos
    };
  }

  async register(registerDto: RegisterUserDto) {
    // Verificar si ya existe
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [
          { ci: registerDto.ci },
          { email: registerDto.email },
        ],
      },
    });

    if (existingUser) {
      throw new ConflictException('El CI o email ya están registrados');
    }

    // Hashear contraseña
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // Crear usuario
    const user = await this.prisma.user.create({
      data: {
        ci: registerDto.ci,
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
        email: registerDto.email,
        phone: registerDto.phone,
        password: hashedPassword,
        barcode: registerDto.barcode || registerDto.ci,
        hasSystemAccess: false, // Por defecto no tiene acceso al sistema
        hasAttendance: false, // Por defecto no registra asistencia
      },
    });

    return {
      id: user.id,
      ci: user.ci,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      barcode: user.barcode,
      message: 'Usuario creado exitosamente. Un administrador debe asignar roles y permisos.',
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken);

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        include: {
          roles: {
            include: {
              role: {
                include: {
                  permissions: {
                    include: {
                      permission: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!user || !user.isActive) {
        throw new UnauthorizedException('Usuario no autorizado');
      }

      const roles = user.roles.map((ur) => ur.role.name);
      const permissions = user.roles.flatMap((ur) =>
        ur.role.permissions.map((rp) => `${rp.permission.module}:${rp.permission.action}`),
      );

      const newPayload = {
        sub: user.id,
        ci: user.ci,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roles,
        permissions,
        hasSystemAccess: user.hasSystemAccess,
      };

      const accessToken = await this.jwtService.signAsync(newPayload);

      return {
        accessToken,
        expiresIn: 86400,
      };
    } catch {
      throw new UnauthorizedException('Refresh token inválido');
    }
  }
}
