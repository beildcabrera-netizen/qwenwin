import { Controller, Get, Post, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/payment.dto';
import { AuthGuard } from '../../iam/guards/auth.guard';
import { PermissionsGuard } from '../../iam/guards/permissions.guard';
import { RequirePermissions } from '../../iam/decorators/permissions.decorator';

@ApiTags('Academy - Pagos')
@Controller('api/academy/payments')
@UseGuards(AuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @RequirePermissions('academy_payments', 'create')
  @ApiOperation({ summary: 'Registrar nuevo pago con descuento automático por antigüedad' })
  @ApiResponse({ status: 201, description: 'Pago registrado exitosamente' })
  create(@Body() dto: CreatePaymentDto, @Request() req: any) {
    return this.paymentsService.createPayment(dto, req.user.userId);
  }

  @Get()
  @RequirePermissions('academy_payments', 'read')
  @ApiOperation({ summary: 'Listar pagos con filtros' })
  @ApiResponse({ status: 200, description: 'Lista de pagos' })
  findAll(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('studentId') studentId?: string,
    @Query('status') status?: string,
  ) {
    return this.paymentsService.findAll({
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      studentId,
      status,
    });
  }

  @Get(':id')
  @RequirePermissions('academy_payments', 'read')
  @ApiOperation({ summary: 'Obtener detalle de un pago' })
  @ApiResponse({ status: 200, description: 'Detalle del pago' })
  findOne(@Param('id') id: string) {
    return this.paymentsService.findOne(id);
  }

  @Get('reports/income-summary')
  @RequirePermissions('academy_payments', 'read')
  @ApiOperation({ summary: 'Resumen de ingresos por período' })
  @ApiResponse({ status: 200, description: 'Resumen de ingresos' })
  getIncomeSummary(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    if (!startDate || !endDate) {
      throw new Error('startDate y endDate son requeridos');
    }
    return this.paymentsService.getIncomeSummary(new Date(startDate), new Date(endDate));
  }
}
