import { Controller, Get, Param, Query } from '@nestjs/common';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @Get()
  async findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
    @Query('categoryId') categoryId?: string,
  ) {
    return this.productsService.findAll(+page, +limit, categoryId);
  }

  @Get('featured')
  async findFeatured(@Query('limit') limit: string = '8') {
    return this.productsService.findFeatured(+limit);
  }

  @Get('best-sellers')
  async findBestSellers(@Query('limit') limit: string = '8') {
    return this.productsService.findBestSellers(+limit);
  }

  @Get('new-arrivals')
  async findNewArrivals(@Query('limit') limit: string = '8') {
    return this.productsService.findNewArrivals(+limit);
  }

  @Get(':slug')
  async findBySlug(@Param('slug') slug: string) {
    return this.productsService.findBySlug(slug);
  }
}
