// src/shop/shop.data.ts
export const PRODUCTS = [
  {
    id: 1,
    name: 'shop_items.rainbow.name',
    image: '/raduga.webp',
    description: 'shop_items.rainbow.description',
    price: 12,
    category: 'Standard',
    features: [
      'shop_items.rainbow.feature1',
      'shop_items.rainbow.feature2',
      'shop_items.rainbow.feature3',
    ],
  },
  {
    id: 2,
    name: 'shop_items.kitty.name',
    image: '/kitty.webp',
    description: 'shop_items.kitty.description',
    price: 15,
    category: 'Premium',
    features: [
      'shop_items.kitty.feature1',
      'shop_items.kitty.feature2',
      'shop_items.kitty.feature3',
    ],
  },
  {
    id: 3,
    name: 'shop_items.luxary.name',
    image: '/luxary.webp',
    description: 'shop_items.luxary.description',
    price: 6,
    category: 'Standard',
    features: ['shop_items.luxary.feature1', 'shop_items.luxary.feature2'],
  },
  {
    id: 4,
    name: 'shop_items.omg.name',
    image: '/omg.webp',
    description: 'shop_items.omg.description',
    price: 2,
    category: 'Premium',
    features: [
      'shop_items.omg.feature1',
      'shop_items.omg.feature2',
      'shop_items.omg.feature3',
    ],
  },
  {
    id: 5,
    name: 'shop_items.kitty_2.name',
    image: '/kitty.webp',
    description: 'shop_items.kitty_2.description',
    price: 15,
    category: 'Premium',
    features: [
      'shop_items.kitty_2.feature1',
      'shop_items.kitty_2.feature2',
      'shop_items.kitty_2.feature3',
    ],
  },
  {
    id: 6,
    name: 'shop_items.luxary_2.name',
    image: '/luxary.webp',
    description: 'shop_items.luxary_2.description',
    price: 6,
    category: 'Standard',
    features: ['shop_items.luxary_2.feature1', 'shop_items.luxary_2.feature2'],
  },
];

export const user = {
  id: 1,
  points: 5000,
  purchasedItems: [] as number[],
};
