# Игровая система - Документация

## Обзор

Система игр интегрирована с backend-login и предоставляет API для:
- Сохранения прогресса игроков
- Управления лидербордами
- Системы титулов и достижений
- Статистики игроков

## Модели базы данных

### GameProgress
```sql
model GameProgress {
  id        Int      @id @default(autoincrement())
  userId    Int
  gameName  String   // asteroids, snake, pingpong, tictactoe, mathbattle, tir, knowledgemaze, don
  score     Int      @default(0)
  level     Int      @default(1)
  timeSpent Int      @default(0) // в секундах
  completed Boolean  @default(false)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user User @relation(fields: [userId], references: [id])

  @@unique([userId, gameName])
}
```

### Leaderboard
```sql
model Leaderboard {
  id        Int      @id @default(autoincrement())
  userId    Int
  gameName  String
  score     Int
  rank      Int?
  createdAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id])

  @@unique([userId, gameName])
}
```

### UserTitle
```sql
model UserTitle {
  id        Int      @id @default(autoincrement())
  userId    Int
  titleName String   // "Snake Master", "Math Genius", etc.
  earnedAt  DateTime @default(now())

  user User @relation(fields: [userId], references: [id])

  @@unique([userId, titleName])
}
```

## API Endpoints

### Сохранение прогресса
```
POST /games/progress
Content-Type: application/json
Authorization: Bearer <token>

{
  "gameName": "snake",
  "score": 1500,
  "level": 3,
  "timeSpent": 300,
  "completed": true
}
```

### Получение прогресса
```
GET /games/progress          // все игры
GET /games/progress/snake    // конкретная игра
```

### Лидерборд
```
GET /games/leaderboard/snake?limit=10
GET /games/leaderboard/snake/rank  // ранг текущего пользователя
```

### Титулы
```
GET /games/titles  // титулы пользователя
```

### Статистика
```
GET /games/stats   // общая статистика пользователя
```

## Система титулов

### Доступные титулы:
- **Snake Master** - 1000+ очков в Snake
- **Math Genius** - 500+ очков в Math Battle
- **Asteroid Hunter** - 2000+ очков в Asteroids
- **Tic Tac Toe Champion** - победа в Tic Tac Toe
- **Ping Pong Pro** - 1500+ очков в Ping Pong
- **Sharp Shooter** - 800+ очков в Tir
- **Knowledge Seeker** - завершение Knowledge Maze
- **Don Master** - 300+ очков в Don
- **Game Collector** - игра в 5+ разных играх
- **High Scorer** - 10000+ общих очков

## Интеграция с фронтендом

### Пример использования:
```javascript
import { saveGameProgress, getLeaderboard } from '../utils/gamesApi';

// Сохранение результата игры
const result = await saveGameProgress('snake', {
  score: 1500,
  level: 3,
  timeSpent: 300,
  completed: true
});

// Получение лидерборда
const leaderboard = await getLeaderboard('snake', 10);
```

### Утилиты для игр:
```javascript
import { gameIntegrations, createGameTimer } from '../utils/gameIntegration';

// Создание таймера
const timer = createGameTimer();

// В конце игры
const timeSpent = timer.getTimeSpent();
await gameIntegrations.snake.onGameEnd(score, timeSpent);
```

## История покупок

### PurchaseHistory
```sql
model PurchaseHistory {
  id          Int      @id @default(autoincrement())
  userId      Int
  productName String
  amount      Float
  currency    String   @default("points")
  quantity    Int      @default(1)
  totalCost   Float
  purchaseAt  DateTime @default(now())
  source      String   @default("shop")

  user User @relation(fields: [userId], references: [id])
}
```

### API для покупок:
```
POST /purchase-history/record
GET /purchase-history/purchases
GET /purchase-history/stats
```

## Запуск и тестирование

1. Убедитесь, что база данных обновлена:
```bash
npx prisma migrate dev
```

2. Запустите сервер:
```bash
npm run start:dev
```

3. Тестирование API:
```bash
# Сохранение прогресса
curl -X POST http://localhost:3000/games/progress \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"gameName":"snake","score":1000,"level":2,"timeSpent":180,"completed":true}'

# Получение лидерборда
curl http://localhost:3000/games/leaderboard/snake
```

