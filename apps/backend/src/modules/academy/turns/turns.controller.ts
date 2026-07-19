import { Controller, Get, Post, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TurnsService } from './turns.service';
import { OpenTurnDto, CloseTurnDto, TurnWithdrawalDto } from './dto/turn.dto';
import { AuthGuard } from '../../iam/guards/auth.guard';
import { PermissionsGuard } from '../../iam/guards/permissions.guard';
import { RequirePermissions } from '../../iam/decorators/permissions.decorator';

@ApiTags('Academy - Turnos')
@Controller('api/academy/turns')
@UseGuards(AuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class TurnsController {
  constructor(private readonly turnsService: TurnsService) {}

  @Post('open')
  @RequirePermissions('academy_turns', 'create')
  @ApiOperation({ summary: 'Apertura de turno' })
  @ApiResponse({ status: 201, description: 'Turno abierto exitosamente' })
  openTurn(@Body() dto: OpenTurnDto, @Request() req: any) {
    return this.turnsService.openTurn(dto, req.user.userId);
  }

  @Post(':id/withdraw')
  @RequirePermissions('academy_turns', 'update')
  @ApiOperation({ summary: 'Registrar retiro de dinero del turno' })
  @ApiResponse({ status: 201, description: 'Retiro registrado' })
  registerWithdrawal(
    @Param('id') turnId: string,
    @Body() dto: TurnWithdrawalDto,
    @Request() req: any,
  ) {
    return this.turnsService.registerWithdrawal(turnId, dto, req.user.userId);
  }

  @Post(':id/close')
  @RequirePermissions('academy_turns', 'update')
  @ApiOperation({ summary: 'Cierre de turno con arqueo' })
  @ApiResponse({ status: 200, description: 'Turno cerrado con arqueo' })
  closeTurn(@Param('id') turnId: string, @Body() dto: CloseTurnDto, @Request() req: any) {
    return this.turnsService.closeTurn(turnId, dto, req.user.userId);
  }

  @Get('active')
  @RequirePermissions('academy_turns', 'read')
  @ApiOperation({ summary: 'Obtener turno activo del usuario' })
  @ApiResponse({ status: 200, description: 'Turno activo o null' })
  getActiveTurn(@Request() req: any) {
    return this.turnsService.getActiveTurn(req.user.userId);
  }

  @Get()
  @RequirePermissions('academy_turns', 'read')
  @ApiOperation({ summary: 'Historial de turnos con filtros' })
  @ApiResponse({ status: 200, description: 'Lista de turnos' })
  getTurnHistory(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('userId') userId?: string,
    @Query('status') status?: string,
  ) {
    return this.turnsService.getTurnHistory({
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      userId,
      status,
    });
  }

  @Post(':id/link-payment')
  @RequirePermissions('academy_turns', 'update')
  @ApiOperation({ summary: 'Vincular pago a turno' })
  @ApiResponse({ status: 201, description: 'Pago vinculado al turno' })
  linkPaymentToTurn(
    @Param('id') turnId: string,
    @Body('paymentId') paymentId: string,
    @Request() req: any,
  ) {
    return this.turnsService.linkPaymentToTurn(turnId, paymentId, req.user.userId);
  }
}
