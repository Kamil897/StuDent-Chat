import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Info, Play, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import s from './Games.module.scss';
import { getMaxPoints } from '../utils/pointsHelper';

const Games = () => {
  const { t, i18n } = useTranslation(); // без namespace
  const navigate = useNavigate();
  const [selectedGame, setSelectedGame] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [showCongrats, setShowCongrats] = useState(false);

  const [currentPoints, setCurrentPoints] = useState(() => {
    const savedPoints = localStorage.getItem('currentPoints');
    return savedPoints ? parseInt(savedPoints, 10) : 0;
  });

  // ✅ Load points from backend
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token'); // токен ты сохраняешь при логине
        const res = await fetch(`http://localhost:3000/auth/me`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
  
        if (!res.ok) throw new Error('Unauthorized');
        
        const data = await res.json();
        setCurrentPoints(data.karmaPoints || 0);
      } catch (err) {
        console.error('Failed to fetch user:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, []);
  

  const maxPoints = getMaxPoints();

  useEffect(() => {
    setIsLoading(false);
  }, []);

  const rawGames = t('games.list', { returnObjects: true });
  const games = Array.isArray(rawGames) ? rawGames : [];

  const categories = ['All', ...new Set(games.map(game => game.category))];

  const translatedCategories = {
    All: t('games.categories.all'),
    Classic: t('games.categories.classic'),
    Board: t('games.categories.board'),
    Action: t('games.categories.action'),
    Educational: t('games.categories.educational'),
    Arcade: t('games.categories.arcade'),
    Sports: t('games.categories.sports'),
    'My tituls': t('games.categories.myTituls')
  };


  // ✅ Call backend to add points
  const addPoints = async (pointsToAdd = 500) => {
    try {
      const res = await fetch(`http://localhost:3000/auth/add-points`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ points: pointsToAdd })
      });
      const updatedUser = await res.json();

      if (res.ok) {
        setCurrentPoints(updatedUser.karmaPoints);
        if (updatedUser.karmaPoints >= maxPoints) {
          setShowCongrats(true);
          document.body.style.overflow = 'hidden';
        }
      } else {
        console.error('Error adding points:', updatedUser.error);
      }
    } catch (err) {
      console.error('Failed to add points:', err);
    }
  };
  const openModal = (game) => {
    setSelectedGame(game);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setSelectedGame(null);
    document.body.style.overflow = 'auto';
  };

  const playGame = (link) => {
    addPoints();
    closeModal();
    navigate(link);
  };

  const filteredGames = selectedCategory === 'All'
    ? games
    : games.filter(game => game.category === selectedCategory);

  return (
    <div className={s.container}>
      <div className={s.topButtons}>
        <button className={s.backButton} onClick={() => navigate('/MainPage')}>
          {t('games.back')}
        </button>

        <button className={s.leaderboardButton} onClick={() => navigate('/LeaderBoard')}>
          🏆 LeaderBoard
        </button>
      </div>

      <div className={s.progressContainer}>
        <h3>{t('games.progress')} {currentPoints} / {maxPoints}</h3>
        <div className={s.progressBar}>
          <div
            className={s.progressFill}
            style={{ width: `${(currentPoints / maxPoints) * 100}%` }}
          />
        </div>
        <div className={s.progressText}>
          {(currentPoints / maxPoints * 100).toFixed(1)}%
        </div>
      </div>

      <div className={s.filterSection}>
        {categories.map(category => (
          <button
            key={category}
            className={`${s.filterButton} ${selectedCategory === category ? s.active : ''}`}
            onClick={() => setSelectedCategory(category)}
          >
            {translatedCategories[category]}
          </button>
        ))}
      </div>

      <div className={s.gamesGrid}>
        {isLoading ? (
          Array(8).fill().map((_, index) => (
            <div key={`skeleton-${index}`} className={s.skeletonCard}></div>
          ))
        ) : filteredGames.length > 0 ? (
          filteredGames.map((game) => (
            <div key={game.id} className={s.gameCard}>
              <div className={s.gameImageWrapper} onClick={() => openModal(game)}>
                <img src={game.image} alt={game.name} className={s.gameImage} />
                {game.category && <div className={s.categoryTag}>{translatedCategories[game.category]}</div>}
              </div>
              <div className={s.gameInfo}>
                <h3>{game.name}</h3>
                <button onClick={() => openModal(game)} className={s.infoButton}>
                  <Info size={20} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className={s.noGamesFound}>
            <Search size={48} />
            <p>{t('games.noGamesFound')}</p>
          </div>
        )}
      </div>

      {selectedGame && (
        <div className={s.modalOverlay} onClick={closeModal}>
          <div className={s.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={s.modalHeader}>
              <h2>{selectedGame.name}</h2>
            </div>
            <p>{selectedGame.description}</p>
            <button onClick={closeModal} className={s.closeButton}></button>
            <button
              onClick={() => playGame(selectedGame.link)}
              className={s.playButton}
            >
              <Play size={18} />
              {t('games.playNow')}
            </button>
          </div>
        </div>
      )}

      {showCongrats && (
        <div className={s.modalOverlay} onClick={() => {
          setShowCongrats(false);
          document.body.style.overflow = 'auto';
        }}>
          <div className={s.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={s.modalHeader}>
              <h2>{t('games.congratsTitle')}</h2>
            </div>
            <p>{t('games.congratsText')}</p>
            <button
              className={s.playButton}
              onClick={() => {
                setShowCongrats(false);
                document.body.style.overflow = 'auto';
              }}
            >
              {t('games.close')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Games;
