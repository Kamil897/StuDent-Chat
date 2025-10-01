import React, { useState, useEffect, useRef, useCallback } from 'react';
import styles from './Snake.module.scss';
import { getMaxPoints, addGamePoints } from '../utils/pointsHelper';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../Context/UserContext';
import { useTranslation } from 'react-i18next';
import { saveGameProgress } from '../utils/gamesApi';

const TILE_SIZE = 20;
const ROWS = 20;
const COLS = 20;
const INITIAL_SNAKE = [
  { x: Math.floor(COLS / 2), y: Math.floor(ROWS / 2) },
  { x: Math.floor(COLS / 2) - 1, y: Math.floor(ROWS / 2) },
  { x: Math.floor(COLS / 2) - 2, y: Math.floor(ROWS / 2) },
];
const INITIAL_DIRECTION = 'e';
const GAME_DURATION = 60;

function Snake() {
  const navigate = useNavigate();
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [food, setFood] = useState(generateFood(INITIAL_SNAKE));
  const [direction, setDirection] = useState(INITIAL_DIRECTION);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [settings, setSettings] = useState({
    speed: 100,
    snakeColor: '#0f0',
    foodColor: '#f00',
    foodShape: 'circle',
  });
  const {addPoints} = useUser()
  const { t } = useTranslation();

  const timerRef = useRef(null);
  const touchStartRef = useRef({ x: 0, y: 0 });
  const boardRef = useRef(null);

  useEffect(() => {
    const preventScroll = (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
      }
    };
    window.addEventListener('keydown', preventScroll);
    return () => window.removeEventListener('keydown', preventScroll);
  }, []);

  useEffect(() => {
    if (!isGameStarted) return;
    const handleKeyDown = (e) => {
      const newDirection = getDirection(e.key, direction);
      if (newDirection) setDirection(newDirection);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [direction, isGameStarted]);

  useEffect(() => {
    if (!isGameStarted) return;
    const interval = setInterval(() => moveSnake(), settings.speed);
    return () => clearInterval(interval);
  }, [direction, food, settings.speed, isGameStarted]);

  useEffect(() => {
    if (!isGameStarted) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          endGame();
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [isGameStarted]);

  const moveSnake = () => {
    setSnake((prevSnake) => {
      const head = prevSnake[0];
      const newHead = getNextPosition(head, direction);

      // Телепортация змеи через стены
      if (newHead.x < 0) {
        newHead.x = COLS - 1; // Появление с правой стороны
      } else if (newHead.x >= COLS) {
        newHead.x = 0; // Появление с левой стороны
      }

      if (newHead.y < 0) {
        newHead.y = ROWS - 1; // Появление снизу
      } else if (newHead.y >= ROWS) {
        newHead.y = 0; // Появление сверху
      }

      // Проверка на столкновение с собой
      if (checkSelfCollision(newHead, prevSnake)) {
        endGame();
        return prevSnake;
      }

      const newSnake = [newHead, ...prevSnake];

      // Если змея съела еду
      if (newHead.x === food.x && newHead.y === food.y) {
        setScore((prev) => prev + 1);
        setFood(generateFood(newSnake));
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  };

const endGame = useCallback(() => {
  setIsGameOver(true);
  setIsGameStarted(false);
  clearInterval(timerRef.current);

  setScore((currentScore) => {
    const bestScore = parseInt(localStorage.getItem('snakeScore')) || 0;
    if (currentScore > bestScore) {
      localStorage.setItem('snakeScore', currentScore.toString());
    }

    addPoints(currentScore);
    
    // Сохраняем прогресс в backend
    saveGameProgress('snake', {
      score: currentScore,
      level: Math.floor(currentScore / 10) + 1,
      timeSpent: GAME_DURATION - timeLeft,
      completed: currentScore >= 50
    });
    
    return currentScore; 
  });
}, [addPoints, timeLeft]);


  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setFood(generateFood(INITIAL_SNAKE));
    setDirection(INITIAL_DIRECTION);
    setScore(0);
    setTimeLeft(GAME_DURATION);
    setIsGameOver(false);
    setIsGameStarted(false);
  };

  const openSettings = () => {
    const newSpeed = prompt('Enter snake speed (lower is faster):', settings.speed);
    const newSnakeColor = prompt('Enter snake color (e.g., #0f0):', settings.snakeColor);
    const newFoodColor = prompt('Enter food color (e.g., #f00):', settings.foodColor);
    const newFoodShape = prompt('Enter food shape (circle/square):', settings.foodShape);
    setSettings({
      speed: parseInt(newSpeed) || settings.speed,
      snakeColor: newSnakeColor || settings.snakeColor,
      foodColor: newFoodColor || settings.foodColor,
      foodShape: newFoodShape === 'square' ? 'square' : 'circle',
    });
  };

  useEffect(() => {
    if (score >= 20) {
      const titles = JSON.parse(localStorage.getItem('titlesUnlocked')) || [];
  
      if (!titles.includes('snake')) {
        const updated = [...titles, 'snake'];
        localStorage.setItem('titlesUnlocked', JSON.stringify(updated));
        console.log('🏆 Титул получен: snake');
      }
    }
  }, [score]);
  

  const handleTouchStart = useCallback((e) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (!isGameStarted) return;
    e.preventDefault();
    const touch = e.touches[0];
    const diffX = touch.clientX - touchStartRef.current.x;
    const diffY = touch.clientY - touchStartRef.current.y;

    if (Math.abs(diffX) > Math.abs(diffY)) {
      if (diffX > 20 && direction !== 'w') {
        setDirection('e');
      } else if (diffX < -20 && direction !== 'e') {
        setDirection('w');
      }
    } else {
      if (diffY > 20 && direction !== 'n') {
        setDirection('s');
      } else if (diffY < -20 && direction !== 's') {
        setDirection('n');
      }
    }

    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  }, [direction, isGameStarted]);

  const handleDirectionButtonClick = useCallback((newDirection) => {
    if (isGameStarted && newDirection !== getOppositeDirection(direction)) {
      setDirection(newDirection);
    }
  }, [direction, isGameStarted]);

  const bestScore = Math.max(score, parseInt(localStorage.getItem('snakeScore')) || 0);

  return (
    <div className={styles.app}>
      {!isGameStarted && !isGameOver ? (
        <div className={styles.menu}>
          <h1>{t('snake.title')}</h1>
          <button onClick={() => setIsGameStarted(true)}>{t('snake.play')}</button>
          <button onClick={openSettings}>{t('snake.settings')}</button>
          <button onClick={() => navigate("/Games")}>{t('snake.exit')}</button>

          <div className={styles.instructions}>
            <p>{t('snake.instructions.mobile')}</p>
            <p>{t('snake.instructions.desktop')}</p>
          </div>
        </div>
      ) : isGameOver ? (
        <div className={styles.menu}>
          <h1>{t('snake.gameOver')}</h1>
          <p>{t('snake.score')}: {score}</p>
          <p>{t('snake.bestScore')}: {bestScore}</p>
          <button onClick={resetGame}>{t('snake.playAgain')}</button>
          <button onClick={openSettings}>{t('snake.settings')}</button>
          <button onClick={() => navigate("/Games")}>{t('snake.exit')}</button>
        </div>
      ) : (
        <>
          <div className={styles.infoBar}>
            <h1 className={styles.score}>{t('snake.score')}: {score}</h1>
            <h1 className={styles.timer}>{t('snake.timeLeft')}: {timeLeft}s</h1>
            <button className={styles.menuButton} onClick={resetGame}>{t('snake.menu')}</button>
          </div>
          <div
            ref={boardRef}
            className={styles.board}
            style={{ width: `${COLS * TILE_SIZE}px`, height: `${ROWS * TILE_SIZE}px` }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
          >
            
            {Array.from({ length: ROWS }).map((_, y) => (
              <div key={y} className={styles.row}>
                {Array.from({ length: COLS }).map((_, x) => (
                  <div key={x} className={styles.cell}></div>
                ))}
              </div>
            ))}
            {snake.map((segment, index) => (
              <div
                key={index}
                className={styles.snake}
                style={{
                  left: `${segment.x * TILE_SIZE}px`,
                  top: `${segment.y * TILE_SIZE}px`,
                  backgroundColor: settings.snakeColor,
                }}
              ></div>
            ))}
            <div
              className={styles.food}
              style={{
                left: `${food.x * TILE_SIZE}px`,
                top: `${food.y * TILE_SIZE}px`,
                backgroundColor: settings.foodColor,
                borderRadius: settings.foodShape === 'circle' ? '50%' : '0%',
              }}
            ></div>
          </div>
          

          <div className={styles.mobileControls}>
            <div className={styles.controlPad}>
              <button 
                className={styles.directionButton}
                onClick={() => handleDirectionButtonClick('n')}
                disabled={!isGameStarted || direction === 's'}
              >
                ↑
              </button>
              <div className={styles.horizontalControls}>
                <button 
                  className={styles.directionButton}
                  onClick={() => handleDirectionButtonClick('w')}
                  disabled={!isGameStarted || direction === 'e'}
                >
                  ←
                </button>
                <button 
                  className={styles.directionButton}
                  onClick={() => handleDirectionButtonClick('e')}
                  disabled={!isGameStarted || direction === 'w'}
                >
                  →
                </button>
              </div>
              <button 
                className={styles.directionButton}
                onClick={() => handleDirectionButtonClick('s')}
                disabled={!isGameStarted || direction === 'n'}
              >
                ↓
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

const getNextPosition = (head, direction) => {
  switch (direction) {
    case 'n':
      return { x: head.x, y: head.y - 1 };
    case 's':
      return { x: head.x, y: head.y + 1 };
    case 'e':
      return { x: head.x + 1, y: head.y };
    case 'w':
      return { x: head.x - 1, y: head.y };
    default:
      return head;
  }
};

const checkSelfCollision = (newHead, snake) => {
  return snake.some((segment) => segment.x === newHead.x && segment.y === newHead.y);
};

const generateFood = (snake) => {
  let foodPosition;
  do {
    foodPosition = {
      x: Math.floor(Math.random() * COLS),
      y: Math.floor(Math.random() * ROWS),
    };
  } while (snake.some((segment) => segment.x === foodPosition.x && segment.y === foodPosition.y));
  return foodPosition;
};

const getDirection = (key, currentDirection) => {
  switch (key) {
    case 'ArrowUp':
    case 'w':
      return currentDirection !== 's' ? 'n' : null;
    case 'ArrowDown':
    case 's':
      return currentDirection !== 'n' ? 's' : null;
    case 'ArrowLeft':
    case 'a':
      return currentDirection !== 'e' ? 'w' : null;
    case 'ArrowRight':
    case 'd':
      return currentDirection !== 'w' ? 'e' : null;
    default:
      return null;
  }
};

const getOppositeDirection = (direction) => {
  switch (direction) {
    case 'n':
      return 's';
    case 's':
      return 'n';
    case 'e':
      return 'w';
    case 'w':
      return 'e';
    default:
      return null;
  }
};

export default Snake;