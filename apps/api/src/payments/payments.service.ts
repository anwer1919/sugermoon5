import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PaymentsService {
  private stripe: Stripe;

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {
    this.stripe = new Stripe(this.config.get('STRIPE_SECRET_KEY')!, {
      apiVersion: '2024-04-10',
    });
  }

  async createPaymentIntent(orderId: string, amount: number, currency = 'usd') {
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency,
      metadata: { orderId },
    });

    await this.prisma.payment.upsert({
      where: { orderId },
      update: {
        providerRef: paymentIntent.id,
        amount,
        currency,
      },
      create: {
        orderId,
        method: 'STRIPE',
        providerRef: paymentIntent.id,
        amount,
        currency,
      },
    });

    return { clientSecret: paymentIntent.client_secret };
  }

  async confirmPayment(orderId: string) {
    const payment = await this.prisma.payment.findUnique({ where: { orderId } });
    if (!payment) throw new NotFoundException('Payment not found');

    await this.prisma.payment.update({
      where: { orderId },
      data: { status: 'PAID' },
    });

    await this.prisma.order.update({
      where: { id: orderId },
      data: { status: 'CONFIRMED' },
    });

    return { message: 'Payment confirmed' };
  }

  async findByOrder(orderId: string) {
    return this.prisma.payment.findUnique({ where: { orderId } });
  }
}
