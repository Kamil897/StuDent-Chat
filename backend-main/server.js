const express = require("express");
const cors = require("cors");
require("dotenv").config();
const Stripe = require("stripe"); // Import Stripe
const { PRODUCTS, user } = require("./src/shop/shop.data");

const app = express();
const PORT = 7777;

const stripe = Stripe(process.env.REMOVED); // Your secret key here

app.use(cors());
app.use(express.json());

app.get("/products", (_req, res) => {
  res.json(PRODUCTS);
});

app.get("/user", (_req, res) => {
  res.json(user);
});

app.post("/user/add-points", (req, res) => {
  const { points } = req.body;
  if (typeof points !== "number" || points <= 0) {
    return res.status(400).json({ error: "Invalid points value" });
  }
  user.points += points;
  res.json(user);
});

app.post("/user/buy", (req, res) => {
  const { productId } = req.body;
  const product = PRODUCTS.find((p) => p.id === productId);

  if (!product) {
    return res.status(404).json({ error: "Product not found" });
  }
  if (user.purchasedItems.includes(productId)) {
    return res.status(400).json({ error: "Product already purchased" });
  }
  if (user.points < product.price) {
    return res.status(400).json({ error: "Insufficient points" });
  }

  user.points -= product.price;
  user.purchasedItems.push(productId);
  res.json(user);
});

// ✅ Stripe payment route
app.post("/create-checkout-session", async (req, res) => {
  try {
    const { productId } = req.body;
    const product = PRODUCTS.find((p) => p.id === productId);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd", // Change currency if needed
            product_data: {
              name: product.name,
            },
            unit_amount: product.price * 100, // Stripe uses cents
          },
          quantity: 1,
        },
      ],
      success_url: " http://localhost:3000/success",
      cancel_url: " http://localhost:3000/cancel",
    });

    res.json({ url: session.url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
