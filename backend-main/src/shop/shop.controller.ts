import {
  Controller,
  Get,
  Post,
  Body,
  BadRequestException,
} from '@nestjs/common';
import { ShopService, PRODUCTS } from './shop.service';

@Controller('shop')
export class ShopController {
  constructor(private readonly shopService: ShopService) {}

  @Get('/products')
  getProducts() {
    return PRODUCTS;
  }

  // ⚡ больше не возвращаем points напрямую, фронт берет баланс из /wallet/balance
  @Get('/user')
  getUser() {
    return { id: 1, username: 'TestUser' };
  }

  @Post('user/add-points')
  async addPoints(
    @Body('userId') userId: number,
    @Body('points') points: number,
  ) {
    if (!userId || typeof points !== 'number' || points <= 0) {
      throw new BadRequestException('Invalid input');
    }
    return this.shopService.addPoints(points);
  }

  @Post('user/buy')
  async buyProduct(@Body('productId') productId: number) {
    if (!productId) {
      throw new BadRequestException('ProductId is required');
    }
    return this.shopService.buyProduct(productId);
  }

  @Post('create-checkout-session')
  async createCheckout(@Body('productId') productId: number) {
    if (!productId) {
      throw new BadRequestException('ProductId is required');
    }
    const session = await this.shopService.createCheckout(productId);
    return { url: session.url };
  }
}
