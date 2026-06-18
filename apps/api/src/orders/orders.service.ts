import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, data: {
    addressId: string;
    items: { productId: string; quantity: number }[];
    notes?: string;
    couponCode?: string;
  }) {
    let subtotal = 0;
    const orderItems = [];
    
    for (const item of data.items) {
      const product = await this.prisma.product.findUnique({ where: { id: item.productId } });
      if (!product) throw new NotFoundException(`Product ${item.productId} not found`);
      
      const total = Number(product.price) * item.quantity;
      subtotal += total;
      
      orderItems.push({
        productId: item.productId,
        name: product.name,
        quantity: item.quantity,
        price: product.price,
        total,
      });
    }

    const shippingFee = 10;
    const tax = subtotal * 0.15;
    const total = subtotal + shippingFee + tax;
    const orderNumber = `ORD-${Date.now()}`;

    return this.prisma.order.create({
      data: {
        orderNumber,
        userId,
        addressId: data.addressId,
        subtotal,
        shippingFee,
        tax,
        total,
        notes: data.notes,
        items: { create: orderItems },
        tracking: { create: { status: 'RECEIVED' } },
      },
      include: { items: true, tracking: true },
    });
  }

  async findByUser(userId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.order.findMany({
        where: { userId },
        skip,
        take: limit,
        include: { items: true, address: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.order.count({ where: { userId } }),
    ]);
    return { data, total, page, limit };
  }

  async findById(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { items: true, address: true, payment: true, tracking: true },
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async updateStatus(id: string, status: string) {
    return this.prisma.order.update({
      where: { id },
      data: {
        status,
        tracking: { create: { status } },
      },
    });
  }
}
