import { Controller, Get, Post, Body, UseGuards, Req, BadRequestException } from '@nestjs/common';
import { ShopService, PRODUCTS } from './shop.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Request } from 'express';

@Controller('shop')
@UseGuards(JwtAuthGuard)
export class ShopController {
  constructor(private readonly shop: ShopService) {}

  @Get('products')
  getProducts() {
    return PRODUCTS;
  }

  @Post('user/buy')
  async buy(
    @Req() req: Request & { user: { id: number } },
    @Body('productId') productId: number,
  ) {
    if (!productId) throw new BadRequestException('ProductId is required');
    return this.shop.buyProduct(req.user.id, Number(productId));
  }

  @Post('create-checkout-session')
  async createCheckout(@Body('productId') productId: number) {
    if (!productId) throw new BadRequestException('ProductId is required');
    // mock: just return a success url
    return { url: 'http://localhost:5173/Points' };
  }
}


