# Система Достижений

## Описание
Система достижений позволяет игрокам получать награды за выполнение различных игровых задач. Достижения автоматически проверяются при завершении игр и могут начислять очки кармы.

## Модели данных

### Achievement
- `id` - уникальный идентификатор
- `name` - название достижения
- `description` - описание условия получения
- `icon` - иконка (эмодзи или URL)
- `condition` - JSON условие для получения
- `points` - очки кармы за достижение

### UserAchievement
- `userId` - ID пользователя
- `achievementId` - ID достижения
- `earnedAt` - дата получения

## API Endpoints

### GET /achievements
Получить список всех достижений

### GET /achievements/user
Получить достижения текущего пользователя

### GET /achievements/user/:id
Получить достижения пользователя по ID

### POST /achievements/unlock
Открыть достижение вручную
```json
{
  "achievementId": 1
}
```

### GET /achievements/stats
Получить статистику достижений пользователя

## Условия достижений

Система поддерживает следующие типы условий:

```json
{
  "type": "score",
  "value": 1000
}
```

```json
{
  "type": "games_played",
  "value": 10
}
```

```json
{
  "type": "time_spent",
  "value": 3600
}
```

```json
{
  "type": "wins",
  "value": 5
}
```

```json
{
  "type": "combo",
  "value": 10
}
```

## Интеграция с играми

Для автоматической проверки достижений в играх используйте:

```typescript
// В сервисе игры после завершения
const gameData = {
  score: 1500,
  gamesPlayed: 1,
  timeSpent: 300,
  wins: 1,
  combo: 5
};

const unlockedAchievements = await achievementsService.checkAndUnlockAchievements(userId, gameData);
```

## Примеры достижений

1. **Snake Master** - набрать 1000 очков в Snake
2. **Math Genius** - решить 50 математических задач
3. **Speed Demon** - пройти игру менее чем за 60 секунд
4. **Social Butterfly** - добавить 10 друзей
5. **Shopaholic** - совершить 20 покупок




