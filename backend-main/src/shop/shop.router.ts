// src/shop/shop.router.ts
import { Router, Request, Response } from "express";
import { PRODUCTS, user } from "./shop.data";

const shopRouter = Router();

// 📦 Get products
shopRouter.get("/products", (_req: Request, res: Response) => {
  res.json(PRODUCTS);
});

// 👤 Get user data
shopRouter.get("/user", (_req: Request, res: Response) => {
  res.json(user);
});

// 💰 Add points
shopRouter.post("/user/add-points", (req: Request, res: Response) => {
  const { points } = req.body;
  if (typeof points !== "number" || points <= 0) {
    res.status(400).json({ error: "Invalid points value" });
    return;
  }
  user.points += points;
  res.json(user);
});

// 🛒 Buy product
shopRouter.post("/user/buy", (req: Request, res: Response) => {
  const { productId } = req.body;
  const product = PRODUCTS.find((p) => p.id === productId);

  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }
  if (user.purchasedItems.includes(productId)) {
    res.status(400).json({ error: "Product already purchased" });
    return;
  }
  if (user.points < product.price) {
    res.status(400).json({ error: "Insufficient points" });
    return;
  }

  user.points -= product.price;
  user.purchasedItems.push(productId);
  res.json(user);
});

export default shopRouter;
