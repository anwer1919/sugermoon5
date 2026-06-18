import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async findAll(page = 1, limit = 20, categoryId?: string) {
    const where = categoryId ? { categoryId, isActive: true } : { isActive: true };
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        include: { images: true, category: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.product.count({ where }),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findBySlug(slug: string) {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      include: { images: true, category: true, reviews: true },
    });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async findFeatured(limit = 8) {
    return this.prisma.product.findMany({
      where: { isActive: true, isFeatured: true },
      take: limit,
      include: { images: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findBestSellers(limit = 8) {
    return this.prisma.product.findMany({
      where: { isActive: true, isBestSeller: true },
      take: limit,
      include: { images: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findNewArrivals(limit = 8) {
    return this.prisma.product.findMany({
      where: { isActive: true, isNewArrival: true },
      take: limit,
      include: { images: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}
