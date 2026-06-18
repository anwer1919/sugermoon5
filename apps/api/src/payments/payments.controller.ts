import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @Post('create-intent')
  async createIntent(@Body() body: { orderId: string; amount: number }) {
    return this.paymentsService.createPaymentIntent(body.orderId, body.amount);
  }

  @Post('confirm/:orderId')
  async confirm(@Param('orderId') orderId: string) {
    return this.paymentsService.confirmPayment(orderId);
  }

  @Get('order/:orderId')
  async findByOrder(@Param('orderId') orderId: string) {
    return this.paymentsService.findByOrder(orderId);
  }
}
