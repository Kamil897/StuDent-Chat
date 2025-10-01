const API_BASE = 'http://localhost:3000';

// Получение токена из localStorage
const getToken = () => localStorage.getItem('token');

// Базовый запрос с авторизацией
const apiRequest = async (endpoint, options = {}) => {
  const token = getToken();
  if (!token) {
    throw new Error('Необходима авторизация');
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  return response.json();
};

// Сохранение прогресса игры
export const saveGameProgress = async (gameName, data) => {
  try {
    const response = await apiRequest('/games/progress', {
      method: 'POST',
      body: JSON.stringify({
        gameName,
        score: data.score || 0,
        level: data.level || 1,
        timeSpent: data.timeSpent || 0,
        completed: data.completed || false,
      }),
    });

    // Проверяем достижения после сохранения прогресса
    if (response) {
      await checkAchievements(gameName, data);
    }

    return response;
  } catch (error) {
    console.error('Error saving game progress:', error);
    return null;
  }
};

// Проверка достижений
export const checkAchievements = async (gameName, data) => {
  try {
    const response = await apiRequest('/achievements/check', {
      method: 'POST',
      body: JSON.stringify({
        gameName,
        score: data.score || 0,
        level: data.level || 1,
        timeSpent: data.timeSpent || 0,
        completed: data.completed || false,
      }),
    });

    if (response && response.unlockedAchievements) {
      response.unlockedAchievements.forEach(achievement => {
        showAchievementNotification(achievement);
      });
    }
  } catch (error) {
    console.error('Error checking achievements:', error);
  }
};

// Показать уведомление о достижении
export const showAchievementNotification = (achievement) => {
  // Создаем уведомление в localStorage
  const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
  notifications.unshift({
    text: `🏆 Достижение разблокировано: ${achievement.name}`,
    date: new Date().toLocaleString(),
    read: false,
    type: 'achievement'
  });
  localStorage.setItem('notifications', JSON.stringify(notifications));

  // Отправляем событие для обновления UI
  window.dispatchEvent(new CustomEvent('notificationAdded'));
};

// Получение прогресса игры
export const getGameProgress = async (gameName = null) => {
  const endpoint = gameName ? `/games/progress/${gameName}` : '/games/progress';
  return apiRequest(endpoint);
};

// Получение лидерборда
export const getLeaderboard = async (gameName, limit = 10) => {
  return apiRequest(`/games/leaderboard/${gameName}?limit=${limit}`);
};

// Получение ранга пользователя
export const getUserRank = async (gameName) => {
  return apiRequest(`/games/leaderboard/${gameName}/rank`);
};

// Получение титулов пользователя
export const getUserTitles = async () => {
  return apiRequest('/games/titles');
};

// Получение статистики пользователя
export const getUserStats = async () => {
  return apiRequest('/games/stats');
};

// Запись покупки в историю
export const recordPurchase = async (purchaseData) => {
  return apiRequest('/purchase-history/record', {
    method: 'POST',
    body: JSON.stringify(purchaseData),
  });
};

// Получение истории покупок
export const getPurchaseHistory = async () => {
  return apiRequest('/purchase-history/purchases');
};

// Получение статистики покупок
export const getPurchaseStats = async () => {
  return apiRequest('/purchase-history/stats');
};

export const awardTitle = async (titleName) => {
  return apiRequest('/games/award-title', {
    method: 'POST',
    body: JSON.stringify({ titleName }),
  });
};