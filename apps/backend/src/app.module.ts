import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { IamModule } from './modules/iam/iam.module'
import { PrismaModule } from './shared/prisma/prisma.module'
import { AcademyModule } from './modules/academy/academy.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    IamModule,
    AcademyModule,
    // Próximamente: AccessModule, DashboardModule, SettingsModule
  ],
})
export class AppModule {}
