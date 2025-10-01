import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import s from './MyTituls.module.scss';
import { getUserTitles, getUserStats } from '../utils/gamesApi';

const MyTituls = () => {
  const { t } = useTranslation();
  const [titles, setTitles] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newlyUnlocked, setNewlyUnlocked] = useState([]);
  const navigate = useNavigate();
  const audioRef = useRef(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [titlesData, statsData] = await Promise.all([
          getUserTitles(),
          getUserStats()
        ]);
        setTitles(titlesData);
        setStats(statsData);
      } catch (error) {
        console.error('Error loading titles and stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

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

  return (
    <section className={s.section}>
      <div className="container">
        <div className={s.wrap}>
          <button className={s.backButton} onClick={() => navigate(-1)}>
            ← {t('titles.back')}
          </button>

          <h2>Мои Титулы</h2>

          <audio ref={audioRef} src="/success.mp3" preload="auto" />

          {loading ? (
            <div className={s.loading}>Загрузка...</div>
          ) : (
            <>
              {stats && (
                <div className={s.stats}>
                  <h3>Статистика</h3>
                  <div className={s.statsGrid}>
                    <div className={s.statItem}>
                      <span className={s.statLabel}>Всего игр:</span>
                      <span className={s.statValue}>{stats.totalGames}</span>
                    </div>
                    <div className={s.statItem}>
                      <span className={s.statLabel}>Общий счет:</span>
                      <span className={s.statValue}>{stats.totalScore}</span>
                    </div>
                    <div className={s.statItem}>
                      <span className={s.statLabel}>Завершенных игр:</span>
                      <span className={s.statValue}>{stats.completedGames}</span>
                    </div>
                    <div className={s.statItem}>
                      <span className={s.statLabel}>Титулов:</span>
                      <span className={s.statValue}>{stats.titles}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className={s.titlesSection}>
                <h3>Полученные титулы ({titles.length})</h3>
                {titles.length === 0 ? (
                  <div className={s.emptyState}>
                    У вас пока нет титулов. Играйте в игры, чтобы получить их!
                  </div>
                ) : (
                <ul className={s.titlesList}>
                  {titles.map((title, index) => {
                    const isNew = newlyUnlocked.includes(title.id); // <-- отмечаем новые титулы
                    return (
                      <li 
                        key={title.id} 
                        className={`${s.titleItem} ${isNew ? s.newTitle : ''}`}
                      >
                        <div className={s.titleInfo}>
                          <span className={s.titleName}>
                            {titleLabels[title.titleName] || title.titleName}
                          </span>
                          <span className={s.titleDate}>
                            {new Date(title.earnedAt).toLocaleDateString()}
                          </span>
                        </div>
                        <span className={s.titleBadge}>🏆</span>
                      </li>
                    );
                  })}
                </ul>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default MyTituls;
