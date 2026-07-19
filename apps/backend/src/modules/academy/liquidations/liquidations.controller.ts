import { Controller, Post, Body, Get, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { LiquidationsService } from './liquidations.service';
import { CalculateLiquidationDto } from './dto/liquidation.dto';
import { AuthGuard } from '../../iam/guards/auth.guard';
import { PermissionsGuard } from '../../iam/guards/permissions.guard';
import { RequirePermissions } from '../../iam/decorators/permissions.decorator';

@ApiTags('Academy - Liquidaciones')
@Controller('api/academy/liquidations')
@UseGuards(AuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class LiquidationsController {
  constructor(private readonly liquidationsService: LiquidationsService) {}

  @Post('calculate')
  @RequirePermissions('academy_liquidations', 'read')
  @ApiOperation({ summary: 'Calcular liquidación de un usuario por período' })
  @ApiResponse({ status: 200, description: 'Liquidación calculada' })
  calculate(@Body() dto: CalculateLiquidationDto) {
    return this.liquidationsService.calculateLiquidation(
      dto.userId,
      new Date(dto.startDate),
      new Date(dto.endDate),
    );
  }

  @Get('user/:userId')
  @RequirePermissions('academy_liquidations', 'read')
  @ApiOperation({ summary: 'Obtener última liquidación de un usuario' })
  @ApiResponse({ status: 200, description: 'Última liquidación' })
  getUserLastLiquidation(@Param('userId') userId: string, @Request() req: any) {
    // Por defecto, último mes
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    return this.liquidationsService.calculateLiquidation(userId, startDate, endDate);
  }
}
