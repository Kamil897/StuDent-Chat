import * as dotenv from 'dotenv';
dotenv.config();

import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import Stripe from 'stripe';

export const PRODUCTS = [
  {
    id: 1,
    name: "shop_items.rainbow.name",
    image: "/raduga.webp",
    description: "shop_items.rainbow.description",
    price: 12,
    category: "Standard",
    features: [
      "shop_items.rainbow.feature1",
      "shop_items.rainbow.feature2",
      "shop_items.rainbow.feature3"
    ]
  },
  {
    id: 2,
    name: "shop_items.kitty.name",
    image: "/kitty.webp",
    description: "shop_items.kitty.description",
    price: 15,
    category: "Premium",
    features: [
      "shop_items.kitty.feature1",
      "shop_items.kitty.feature2",
      "shop_items.kitty.feature3"
    ]
  },
  {
    id: 3,
    name: "shop_items.luxary.name",
    image: "/luxary.webp",
    description: "shop_items.luxary.description",
    price: 6,
    category: "Standard",
    features: [
      "shop_items.luxary.feature1",
      "shop_items.luxary.feature2"
    ]
  },
  {
    id: 4,
    name: "shop_items.omg.name",
    image: "/omg.webp",
    description: "shop_items.omg.description",
    price: 2,
    category: "Premium",
    features: [
      "shop_items.omg.feature1",
      "shop_items.omg.feature2",
      "shop_items.omg.feature3"
    ]
  },
  {
    id: 5,
    name: "shop_items.kitty_2.name",
    image: "/kitty.webp",
    description: "shop_items.kitty_2.description",
    price: 15,
    category: "Premium",
    features: [
      "shop_items.kitty_2.feature1",
      "shop_items.kitty_2.feature2",
      "shop_items.kitty_2.feature3"
    ]
  },
  {
    id: 6,
    name: "shop_items.luxary_2.name",
    image: "/luxary.webp",
    description: "shop_items.luxary_2.description",
    price: 6,
    category: "Standard",
    features: [
      "shop_items.luxary_2.feature1",
      "shop_items.luxary_2.feature2"
    ]
  }
];

let user = {
  points: 300,
  purchasedItems: [] as number[],
};

@Injectable()
export class ShopService {
  private stripe: Stripe;

  constructor() {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("❌ STRIPE_SECRET_KEY is not set in .env");
    }

    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    });
  }

  getProducts() {
    return PRODUCTS;
  }

  getUser() {
    return user;
  }

  addPoints(points: number) {
    user.points += points;
    return user;
  }

  buyProduct(productId: number) {
    const product = PRODUCTS.find(p => p.id === productId);
    if (!product) throw new NotFoundException('Product not found');

    if (user.purchasedItems.includes(productId)) {
      return user; // idempotent success instead of throwing
    }

    if (user.points < product.price) {
      throw new BadRequestException('Insufficient points');
    }

    user.points -= product.price;
    user.purchasedItems.push(productId);
    return user;
  }

  async createCheckout(productId: number) {
    const product = PRODUCTS.find(p => p.id === productId);
    if (!product) throw new NotFoundException('Product not found');

    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: { name: product.name },
            unit_amount: product.price * 100,
          },
          quantity: 1,
        },
      ],
      success_url: 'http://localhost:5173/Points',
      cancel_url: 'http://localhost:5173/Points',
    });

    return { url: session.url };
  }
}
