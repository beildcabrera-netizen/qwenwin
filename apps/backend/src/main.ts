import { NestFactory } from '@nestjs/core'
import { ValidationPipe, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Reflector } from '@nestjs/core'
import { JwtService } from '@nestjs/jwt'
import { AppModule } from './app.module'
import { AuthGuard } from './modules/iam/guards/auth.guard'
import { PermissionsGuard } from './modules/iam/guards/permissions.guard'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  // CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  })

  // Global prefix
  app.setGlobalPrefix('api')

  // Guards globales
  const reflector = app.get(Reflector)
  const jwtService = app.get(JwtService)
  app.useGlobalGuards(
    new AuthGuard(jwtService, reflector),
    new PermissionsGuard(reflector, jwtService),
  )

  // Validación global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  )

  const configService = app.get(ConfigService)
  const port = configService.get('PORT') || 3000

  await app.listen(port)
  console.log(`🚀 Backend corriendo en http://localhost:${port}`)
  console.log(`📝 API disponible en http://localhost:${port}/api`)
}
bootstrap()
