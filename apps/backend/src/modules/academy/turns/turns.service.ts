import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { OpenTurnDto, CloseTurnDto, TurnWithdrawalDto } from './dto/turn.dto';

@Injectable()
export class TurnsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Apertura de turno - Solo puede haber un turno activo por recepcionista
   */
  async openTurn(dto: OpenTurnDto, userId: string) {
    // Verificar que no haya un turno activo para este usuario
    const activeTurn = await this.prisma.academyTurn.findFirst({
      where: {
        openedBy: userId,
        status: 'OPEN',
      },
    });

    if (activeTurn) {
      throw new ConflictException('Ya tienes un turno activo. Ciérralo antes de abrir uno nuevo.');
    }

    const turn = await this.prisma.academyTurn.create({
      data: {
        initialAmount: dto.initialAmount,
        status: 'OPEN',
        openedAt: new Date(),
        openedBy: userId,
        note: dto.note,
      },
    });

    return turn;
  }

  /**
   * Registrar retiro de dinero del turno
   */
  async registerWithdrawal(turnId: string, dto: TurnWithdrawalDto, userId: string) {
    const turn = await this.prisma.academyTurn.findUnique({
      where: { id: turnId },
    });

    if (!turn) {
      throw new NotFoundException('Turno no encontrado');
    }

    if (turn.status !== 'OPEN') {
      throw new BadRequestException('El turno no está abierto');
    }

    if (turn.closedBy && turn.closedBy !== userId) {
      throw new BadRequestException('Este turno fue cerrado por otro usuario');
    }

    const withdrawal = await this.prisma.academyTurnWithdrawal.create({
      data: {
        turnId,
        amount: dto.amount,
        reason: dto.reason,
        performedBy: userId,
      },
    });

    return withdrawal;
  }

  /**
   * Cierre de turno con arqueo de caja
   */
  async closeTurn(turnId: string, dto: CloseTurnDto, userId: string) {
    const turn = await this.prisma.academyTurn.findUnique({
      where: { id: turnId },
      include: {
        withdrawals: true,
        turnPayments: {
          include: {
            payment: true,
          },
        },
      },
    });

    if (!turn) {
      throw new NotFoundException('Turno no encontrado');
    }

    if (turn.status !== 'OPEN') {
      throw new BadRequestException('El turno ya está cerrado');
    }

    // Calcular monto esperado
    const totalPayments = turn.turnPayments.reduce((acc, tp) => acc + tp.payment.finalAmount, 0);
    const totalWithdrawals = turn.withdrawals.reduce((acc, w) => acc + w.amount, 0);
    const expectedAmount = turn.initialAmount + totalPayments - totalWithdrawals;
    const discrepancy = dto.physicalAmount - expectedAmount;

    // Actualizar turno
    const closedTurn = await this.prisma.academyTurn.update({
      where: { id: turnId },
      data: {
        status: 'CLOSED',
        physicalAmount: dto.physicalAmount,
        expectedAmount,
        discrepancy,
        closedAt: new Date(),
        closedBy: userId,
        closingObservations: dto.observations,
      },
      include: {
        withdrawals: true,
        turnPayments: {
          include: {
            payment: true,
          },
        },
      },
    });

    return {
      ...closedTurn,
      totalPayments,
      totalWithdrawals,
      hasDiscrepancy: discrepancy !== 0,
    };
  }

  /**
   * Obtener turno activo del usuario
   */
  async getActiveTurn(userId: string) {
    const turn = await this.prisma.academyTurn.findFirst({
      where: {
        openedBy: userId,
        status: 'OPEN',
      },
      include: {
        withdrawals: true,
        turnPayments: {
          include: {
            payment: {
              include: {
                enrollment: {
                  include: {
                    student: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!turn) {
      return null;
    }

    const totalPayments = turn.turnPayments.reduce((acc, tp) => acc + tp.payment.finalAmount, 0);
    const totalWithdrawals = turn.withdrawals.reduce((acc, w) => acc + w.amount, 0);
    const expectedAmount = turn.initialAmount + totalPayments - totalWithdrawals;

    return {
      ...turn,
      totalPayments,
      totalWithdrawals,
      expectedAmount,
    };
  }

  /**
   * Vincular un pago a un turno abierto
   */
  async linkPaymentToTurn(turnId: string, paymentId: string, userId: string) {
    const turn = await this.prisma.academyTurn.findUnique({
      where: { id: turnId },
    });

    if (!turn) {
      throw new NotFoundException('Turno no encontrado');
    }

    if (turn.status !== 'OPEN') {
      throw new BadRequestException('El turno no está abierto');
    }

    // Verificar que el pago exista
    const payment = await this.prisma.academyPayment.findUnique({
      where: { id: paymentId },
    });

    if (!payment) {
      throw new NotFoundException('Pago no encontrado');
    }

    // Vincular pago al turno
    const turnPayment = await this.prisma.academyTurnPayment.create({
      data: {
        turnId,
        paymentId,
        amount: payment.finalAmount,
        recordedBy: userId,
      },
    });

    return turnPayment;
  }

  /**
   * Historial de turnos con filtros
   */
  async getTurnHistory(filters: {
    startDate?: Date;
    endDate?: Date;
    userId?: string;
    status?: string;
  }) {
    const where: any = {};

    if (filters.startDate || filters.endDate) {
      where.openedAt = {};
      if (filters.startDate) where.openedAt.gte = filters.startDate;
      if (filters.endDate) where.openedAt.lte = filters.endDate;
    }

    if (filters.userId) {
      where.openedBy = filters.userId;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    const turns = await this.prisma.academyTurn.findMany({
      where,
      include: {
        withdrawals: true,
        turnPayments: {
          include: {
            payment: true,
          },
        },
        openedByUser: true,
        closedByUser: true,
      },
      orderBy: {
        openedAt: 'desc',
      },
    });

    return turns.map((turn) => {
      const totalPayments = turn.turnPayments.reduce((acc, tp) => acc + tp.payment.finalAmount, 0);
      const totalWithdrawals = turn.withdrawals.reduce((acc, w) => acc + w.amount, 0);

      return {
        ...turn,
        totalPayments,
        totalWithdrawals,
        expectedAmount: turn.initialAmount + totalPayments - totalWithdrawals,
      };
    });
  }
}
