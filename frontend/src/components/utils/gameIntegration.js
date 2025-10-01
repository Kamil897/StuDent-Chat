// Пример интеграции игр с backend-login
// Этот файл показывает, как интегрировать игры с новой системой

import { saveGameProgress } from '../../utils/gamesApi';

// Функция для сохранения результатов игры
export const saveGameResult = async (gameName, gameData) => {
  try {
    const result = await saveGameProgress(gameName, {
      score: gameData.score || 0,
      level: gameData.level || 1,
      timeSpent: gameData.timeSpent || 0,
      completed: gameData.completed || false,
    });

    // Если получены новые титулы, показываем уведомление
    if (result.newTitles && result.newTitles.length > 0) {
      showTitleNotification(result.newTitles);
    }

    return result;
  } catch (error) {
    console.error('Error saving game result:', error);
    throw error;
  }
};

// Показать уведомление о новых титулах
const showTitleNotification = (titles) => {
  const titleLabels = {
    'Snake Master': 'Мастер Змейки',
    'Math Genius': 'Гений Математики',
    'Asteroid Hunter': 'Охотник за Астероидами',
    'Tic Tac Toe Champion': 'Чемпион Крестиков-Ноликов',
    'Ping Pong Pro': 'Профессионал Пинг-понга',
    'Sharp Shooter': 'Меткий Стрелок',
    'Knowledge Seeker': 'Искатель Знаний',
    'Don Master': 'Мастер Дона',
    'Game Collector': 'Коллекционер Игр',
    'High Scorer': 'Рекордсмен',
  };

  const titleNames = titles.map(title => titleLabels[title] || title).join(', ');
  
  // Создаем уведомление
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 15px 20px;
    border-radius: 10px;
    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
    z-index: 10000;
    animation: slideIn 0.5s ease-out;
    max-width: 300px;
  `;
  
  notification.innerHTML = `
    <div style="font-weight: bold; margin-bottom: 5px;">🏆 Новый титул!</div>
    <div>${titleNames}</div>
  `;

  // Добавляем стили для анимации
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `;
  document.head.appendChild(style);

  document.body.appendChild(notification);

  // Удаляем уведомление через 5 секунд
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.5s ease-in';
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 500);
  }, 5000);
};

// Примеры интеграции для разных игр
export const gameIntegrations = {
  // Snake
  snake: {
    onGameEnd: async (score, timeSpent) => {
      return saveGameResult('snake', {
        score,
        timeSpent,
        completed: true
      });
    }
  },

  // Asteroids
  asteroids: {
    onGameEnd: async (score, level) => {
      return saveGameResult('asteroids', {
        score,
        level,
        completed: false
      });
    }
  },

  // Math Battle
  mathbattle: {
    onGameEnd: async (score, timeSpent) => {
      return saveGameResult('mathbattle', {
        score,
        timeSpent,
        completed: true
      });
    }
  },

  // Tic Tac Toe
  tictactoe: {
    onGameEnd: async (won, timeSpent) => {
      return saveGameResult('tictactoe', {
        score: won ? 100 : 0,
        timeSpent,
        completed: won
      });
    }
  },

  // Ping Pong
  pingpong: {
    onGameEnd: async (score, timeSpent) => {
      return saveGameResult('pingpong', {
        score,
        timeSpent,
        completed: false
      });
    }
  },

  // Tir
  tir: {
    onGameEnd: async (score, timeSpent) => {
      return saveGameResult('tir', {
        score,
        timeSpent,
        completed: false
      });
    }
  },

  // Knowledge Maze
  knowledgemaze: {
    onGameEnd: async (completed, timeSpent) => {
      return saveGameResult('knowledgemaze', {
        score: completed ? 100 : 0,
        timeSpent,
        completed
      });
    }
  },

  // Don
  don: {
    onGameEnd: async (score, timeSpent) => {
      return saveGameResult('don', {
        score,
        timeSpent,
        completed: false
      });
    }
  }
};

// Утилита для измерения времени игры
export const createGameTimer = () => {
  const startTime = Date.now();
  
  return {
    getTimeSpent: () => Math.floor((Date.now() - startTime) / 1000),
    getTimeSpentMinutes: () => Math.floor((Date.now() - startTime) / 60000)
  };
};

