import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export const PRODUCTS = [
  { id: 1, name: 'shop_items.rainbow.name', image: '/raduga.webp', description: 'shop_items.rainbow.description', price: 12, category: 'Standard', features: [] },
  { id: 2, name: 'shop_items.kitty.name', image: '/kitty.webp', description: 'shop_items.kitty.description', price: 15, category: 'Premium', features: [] },
  { id: 3, name: 'shop_items.luxary.name', image: '/luxary.webp', description: 'shop_items.luxary.description', price: 6, category: 'Standard', features: [] },
  { id: 4, name: 'shop_items.omg.name', image: '/omg.webp', description: 'shop_items.omg.description', price: 2, category: 'Premium', features: [] },
  { id: 5, name: 'shop_items.kitty_2.name', image: '/kitty.webp', description: 'shop_items.kitty_2.description', price: 15, category: 'Premium', features: [] },
  { id: 6, name: 'shop_items.luxary_2.name', image: '/luxary.webp', description: 'shop_items.luxary_2.description', price: 6, category: 'Standard', features: [] },
];

@Injectable()
export class ShopService {
  constructor(private readonly prisma: PrismaService) {}

  getProducts() {
    return PRODUCTS;
  }

  async buyProduct(userId: number, productId: number) {
    const product = PRODUCTS.find((p) => p.id === productId);
    if (!product) throw new NotFoundException('Product not found');

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const balance = user.coins ?? 0;
    if (balance < product.price) throw new BadRequestException('Insufficient points');

    await this.prisma.user.update({ where: { id: userId }, data: { coins: { decrement: product.price } } });

    // record purchase history for consistency
    await this.prisma.purchaseHistory.create({
      data: {
        userId,
        productName: product.name,
        amount: product.price,
        currency: 'points',
        quantity: 1,
        totalCost: product.price,
        source: 'shop',
      },
    });

    return { success: true };
  }
}


