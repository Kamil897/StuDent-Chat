// server.ts
import express, { Request, Response } from "express";
import cors from "cors";
import shopRouter from "./src/shop/shop.router"; // <-- твой роутер магазина

const app = express();
const PORT = 7777;

app.use(cors());
app.use(express.json());

// подключаем магазин
app.use("/shop", shopRouter);

// тестовый эндпоинт
app.get("/", (_req: Request, res: Response) => {
  res.send("✅ Server is working!");
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
