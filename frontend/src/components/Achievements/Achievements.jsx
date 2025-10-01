import React, { useState, useEffect, useMemo } from 'react';
import styles from './Achievements.module.scss';

const Achievements = () => {
  const [achievements, setAchievements] = useState([]);
  const [userAchievements, setUserAchievements] = useState([]);
  const [stats, setStats] = useState(null);  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAchievements();
  }, []);

  const loadAchievements = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const headers = { Authorization: `Bearer ${token}` };

      const [achievementsRes, userAchievementsRes, statsRes] = await Promise.all([
        fetch('http://localhost:3000/achievements', { headers }),
        fetch('http://localhost:3000/achievements/user', { headers }),
        fetch('http://localhost:3000/achievements/stats', { headers })
      ]);

      if (achievementsRes.ok) setAchievements(await achievementsRes.json());
      if (userAchievementsRes.ok) setUserAchievements(await userAchievementsRes.json());
      if (statsRes.ok) setStats(await statsRes.json());
    } catch (error) {
      console.error('Error loading achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Мемоизируем ID открытых достижений
  const unlockedIds = useMemo(
    () => new Set(userAchievements.map(ua => ua.achievementId)),
    [userAchievements]
  );
  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  

  if (loading) {
    return (
      <div className={styles['achievements-container']}>
        <div className={styles.loading}>Загрузка достижений...</div>
      </div>
    );
  }

  return (
    <div className={styles['achievements-container']}>
      <div className={styles['achievements-header']}>
        <h2>🏆 Достижения</h2>
        {stats && (
          <div className={styles['stats-overview']}>
            <div className={styles['stat-item']}>
              <span className={styles['stat-value']}>{stats.totalAchievements}</span>
              <span className={styles['stat-label']}>Получено</span>
            </div>
            <div className={styles['stat-item']}>
              <span className={styles['stat-value']}>{stats.totalPoints}</span>
              <span className={styles['stat-label']}>Очков</span>
            </div>
            <div className={styles['stat-item']}>
              <span className={styles['stat-value']}>{achievements.length}</span>
              <span className={styles['stat-label']}>Всего</span>
            </div>
          </div>
        )}
      </div>

      <div className={styles['achievements-grid']}>
        {achievements.map((achievement) => {
          const isUnlocked = unlockedIds.has(achievement.id);
          const userAchievement = userAchievements.find(ua => ua.achievementId === achievement.id);

          return (
            <div
              key={achievement.id}
              className={`${styles['achievement-card']} ${isUnlocked ? styles.unlocked : styles.locked}`}
            >
              <div className={styles['achievement-icon']}>
                {achievement.icon?.startsWith('http') ? (
                  <img src={achievement.icon} alt={achievement.name} />
                ) : (
                  achievement.icon || '🏆'
                )}
              </div>
              <div className={styles['achievement-info']}>
                <h3 className={styles['achievement-name']}>{achievement.name}</h3>
                <p className={styles['achievement-description']}>{achievement.description}</p>
                <div className={styles['achievement-meta']}>
                  <span className={styles['achievement-points']}>+{achievement.points} очков</span>
                  {isUnlocked && userAchievement && (
                    <span className={styles['achievement-date']}>
                      Получено {formatDate(userAchievement.earnedAt)}
                    </span>
                  )}
                </div>
              </div>
              <div className={styles['achievement-status']}>
                {isUnlocked ? (
                  <span className={styles['status-unlocked']}>✓</span>
                ) : (
                  <span className={styles['status-locked']}>🔒</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {stats?.recentAchievements?.length > 0 && (
        <div className={styles['recent-achievements']}>
          <h3>Недавние достижения</h3>
          <div className={styles['recent-list']}>
            {stats.recentAchievements.map((achievement) => (
              <div key={achievement.name} className={styles['recent-item']}>
                <span className={styles['recent-icon']}>
                  {achievement.icon?.startsWith('http') ? (
                    <img src={achievement.icon} alt={achievement.name} />
                  ) : (
                    achievement.icon || '🏆'
                  )}
                </span>
                <span className={styles['recent-name']}>{achievement.name}</span>
                <span className={styles['recent-date']}>{formatDate(achievement.earnedAt)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Achievements;
