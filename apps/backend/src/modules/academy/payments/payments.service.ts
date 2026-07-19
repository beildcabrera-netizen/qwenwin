import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreatePaymentDto } from './dto/payment.dto';
import { DiscountContext } from './strategies/discount.context';
import { AntiquityDiscountStrategy } from './strategies/antiquity-discount.strategy';

@Injectable()
export class PaymentsService {
  constructor(
    private prisma: PrismaService,
    private discountContext: DiscountContext,
  ) {
    // Registrar estrategias de descuento
    this.discountContext.addStrategy(new AntiquityDiscountStrategy());
  }

  /**
   * Registrar un nuevo pago con cálculo automático de descuentos
   */
  async createPayment(dto: CreatePaymentDto, userId: string) {
    const now = dto.paymentDate ? new Date(dto.paymentDate) : new Date();

    // Verificar que la inscripción existe y está activa
    const enrollment = await this.prisma.academyEnrollment.findUnique({
      where: { id: dto.enrollmentId },
      include: {
        student: true,
        plan: true,
      },
    });

    if (!enrollment) {
      throw new NotFoundException('Inscripción no encontrada');
    }

    if (enrollment.status !== 'ACTIVE') {
      throw new BadRequestException('La inscripción no está activa');
    }

    // Calcular antigüedad del alumno en días
    const antiquityDays = Math.floor(
      (now.getTime() - new Date(enrollment.createdAt).getTime()) / (1000 * 60 * 60 * 24),
    );

    // Calcular descuento usando el patrón Strategy
    const discountData = {
      enrollmentDate: new Date(enrollment.createdAt),
      paymentDate: now,
      baseAmount: dto.amount,
      antiquityDays,
    };

    const discount = this.discountContext.calculateDiscount(discountData);
    const finalAmount = dto.amount - discount;

    // Crear el pago dentro de una transacción ACID
    const payment = await this.prisma.$transaction(async (tx) => {
      // 1. Crear el registro de pago
      const createdPayment = await tx.academyPayment.create({
        data: {
          enrollmentId: dto.enrollmentId,
          originalAmount: dto.amount,
          discount,
          finalAmount,
          paymentMethod: dto.paymentMethod,
          status: 'COMPLETED',
          note: dto.note,
          paymentDate: now,
          paidBy: userId,
          idempotencyKey: this.generateIdempotencyKey(dto.enrollmentId, now),
        },
      });

      // 2. Actualizar el estado de cuenta del alumno (crédito por el pago)
      await tx.academyStudentAccount.update({
        where: { studentId: enrollment.studentId },
        data: {
          balance: {
            decrement: finalAmount, // Restamos del adeudo (si es negativo es crédito)
          },
          lastPaymentDate: now,
        },
      });

      // 3. Extender la fecha de vencimiento de la inscripción según el plan
      const newExpirationDate = this.calculateNewExpirationDate(
        enrollment.expiresAt || now,
        enrollment.plan.durationDays,
        now,
      );

      await tx.academyEnrollment.update({
        where: { id: dto.enrollmentId },
        data: {
          expiresAt: newExpirationDate,
        },
      });

      return createdPayment;
    });

    // TODO: Generar recibo PDF asíncronamente con BullMQ
    // await this.paymentQueue.add('generate-receipt', { paymentId: payment.id });

    return {
      ...payment,
      studentName: `${enrollment.student.firstName} ${enrollment.student.lastName}`,
      discountBreakdown: this.discountContext.getDiscountBreakdown(discountData),
      receiptUrl: `/api/payments/${payment.id}/receipt`,
    };
  }

  /**
   * Obtener todos los pagos con filtros
   */
  async findAll(filters: {
    startDate?: Date;
    endDate?: Date;
    studentId?: string;
    status?: string;
  }) {
    const where: any = {};

    if (filters.startDate || filters.endDate) {
      where.paymentDate = {};
      if (filters.startDate) where.paymentDate.gte = filters.startDate;
      if (filters.endDate) where.paymentDate.lte = filters.endDate;
    }

    if (filters.studentId) {
      where.enrollment = {
        studentId: filters.studentId,
      };
    }

    if (filters.status) {
      where.status = filters.status;
    }

    const payments = await this.prisma.academyPayment.findMany({
      where,
      include: {
        enrollment: {
          include: {
            student: true,
            plan: true,
          },
        },
      },
      orderBy: {
        paymentDate: 'desc',
      },
    });

    return payments.map((p) => ({
      ...p,
      studentName: `${p.enrollment.student.firstName} ${p.enrollment.student.lastName}`,
      groupName: p.enrollment.group?.name,
    }));
  }

  /**
   * Obtener un pago específico
   */
  async findOne(id: string) {
    const payment = await this.prisma.academyPayment.findUnique({
      where: { id },
      include: {
        enrollment: {
          include: {
            student: true,
            plan: true,
          },
        },
        turn: true,
      },
    });

    if (!payment) {
      throw new NotFoundException('Pago no encontrado');
    }

    return {
      ...payment,
      studentName: `${payment.enrollment.student.firstName} ${payment.enrollment.student.lastName}`,
    };
  }

  /**
   * Obtener resumen de ingresos por período
   */
  async getIncomeSummary(startDate: Date, endDate: Date) {
    const result = await this.prisma.academyPayment.groupBy({
      by: ['paymentMethod'],
      where: {
        paymentDate: {
          gte: startDate,
          lte: endDate,
        },
        status: 'COMPLETED',
      },
      _sum: {
        finalAmount: true,
        discount: true,
      },
      _count: true,
    });

    const totalIncome = result.reduce((acc, r) => acc + (r._sum.finalAmount || 0), 0);
    const totalDiscounts = result.reduce((acc, r) => acc + (r._sum.discount || 0), 0);

    return {
      totalIncome,
      totalDiscounts,
      paymentMethods: result.map((r) => ({
        method: r.paymentMethod,
        amount: r._sum.finalAmount || 0,
        count: r._count,
        discounts: r._sum.discount || 0,
      })),
    };
  }

  /**
   * Calcular nueva fecha de vencimiento
   */
  private calculateNewExpirationDate(currentExpiration: Date, durationDays: number, paymentDate: Date): Date {
    // Si el pago se hace antes del vencimiento, se suma desde el vencimiento actual
    // Si el pago se hace después, se suma desde la fecha de pago
    const baseDate = paymentDate > currentExpiration ? paymentDate : currentExpiration;
    return new Date(baseDate.getTime() + durationDays * 24 * 60 * 60 * 1000);
  }

  /**
   * Generar clave de idempotencia para evitar dobles cobros
   */
  private generateIdempotencyKey(enrollmentId: string, paymentDate: Date): string {
    const dateStr = paymentDate.toISOString().split('T')[0];
    return `payment_${enrollmentId}_${dateStr}`;
  }
}
