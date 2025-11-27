import React, { useState, useEffect, useRef } from 'react';
import s from './Snake.module.scss'; // or .module.scss if you prefer SCSS

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

const SPEEDS = {
  easy: 150,
  medium: 100,
  hard: 60,
};

function SnakeGame() {
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [food, setFood] = useState(generateFood(INITIAL_SNAKE));
  const [direction, setDirection] = useState(INITIAL_DIRECTION);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [difficulty, setDifficulty] = useState('medium');
  const [bestScore, setBestScore] = useState(() => {
    return parseInt(localStorage.getItem('snakeBestScore')) || 0;
  });

  const gameLoopRef = useRef(null);
  const timerRef = useRef(null);
  const touchStartRef = useRef({ x: 0, y: 0 });
  const pendingDirectionRef = useRef(INITIAL_DIRECTION);

  useEffect(() => {
    const preventScroll = (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }
    };
    window.addEventListener('keydown', preventScroll);
    return () => window.removeEventListener('keydown', preventScroll);
  }, []);

  useEffect(() => {
    if (!isGameStarted || isGameOver) return;
    const handleKeyDown = (e) => {
      if (e.key === ' ') {
        setIsPaused((prev) => !prev);
        return;
      }
      const newDirection = getDirection(e.key);
      if (newDirection && newDirection !== getOppositeDirection(pendingDirectionRef.current)) {
        pendingDirectionRef.current = newDirection;
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isGameStarted, isGameOver]);

  useEffect(() => {
    if (!isGameStarted || isGameOver || isPaused) return;
    const moveSnake = () => {
      setSnake((prevSnake) => {
        const currentDirection = pendingDirectionRef.current;
        setDirection(currentDirection);
        const head = prevSnake[0];
        const newHead = getNextPosition(head, currentDirection);

        if (newHead.x < 0 || newHead.x >= COLS || newHead.y < 0 || newHead.y >= ROWS) {
          endGame();
          return prevSnake;
        }
        if (checkSelfCollision(newHead, prevSnake)) {
          endGame();
          return prevSnake;
        }

        const newSnake = [newHead, ...prevSnake];
        if (newHead.x === food.x && newHead.y === food.y) {
          setScore((prev) => prev + 1);
          setFood(generateFood(newSnake));
        } else {
          newSnake.pop();
        }
        return newSnake;
      });
    };
    gameLoopRef.current = setInterval(moveSnake, SPEEDS[difficulty]);
    return () => clearInterval(gameLoopRef.current);
  }, [isGameStarted, isGameOver, isPaused, difficulty, food]);

  useEffect(() => {
    if (!isGameStarted || isGameOver || isPaused) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [isGameStarted, isGameOver, isPaused]);

  const endGame = () => {
    setIsGameOver(true);
    setIsGameStarted(false);
    clearInterval(gameLoopRef.current);
    clearInterval(timerRef.current);
    if (score > bestScore) {
      setBestScore(score);
      localStorage.setItem('snakeBestScore', score.toString());
    }
  };

  const startGame = () => {
    setSnake(INITIAL_SNAKE);
    setFood(generateFood(INITIAL_SNAKE));
    setDirection(INITIAL_DIRECTION);
    pendingDirectionRef.current = INITIAL_DIRECTION;
    setScore(0);
    setTimeLeft(GAME_DURATION);
    setIsGameOver(false);
    setIsPaused(false);
    setIsGameStarted(true);
  };

  const togglePause = () => setIsPaused((prev) => !prev);

  const handleDirectionClick = (newDirection) => {
    if (isGameStarted && !isPaused && newDirection !== getOppositeDirection(pendingDirectionRef.current)) {
      pendingDirectionRef.current = newDirection;
    }
  };

  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchMove = (e) => {
    if (!isGameStarted || isPaused) return;
    e.preventDefault();
    const touch = e.touches[0];
    const diffX = touch.clientX - touchStartRef.current.x;
    const diffY = touch.clientY - touchStartRef.current.y;
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 30) {
      const newDir = diffX > 0 ? 'e' : 'w';
      if (newDir !== getOppositeDirection(pendingDirectionRef.current)) {
        pendingDirectionRef.current = newDir;
      }
    } else if (Math.abs(diffY) > 30) {
      const newDir = diffY > 0 ? 's' : 'n';
      if (newDir !== getOppositeDirection(pendingDirectionRef.current)) {
        pendingDirectionRef.current = newDir;
      }
    }
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  return (
    <div className={s.app}>
      {!isGameStarted ? (
        <div className={s.menu}>
          <div className={s.menuHeader}>
            <h1 className={s.menuTitle}>🐍 Snake</h1>
            <p className={s.menuSubtitle}>Classic arcade game</p>
          </div>

          {isGameOver && (
            <div className={s.gameOverBox}>
              <p className={s.gameOverText}>Game Over!</p>
              <div className={s.gameOverStats}>
                <span>Score: {score}</span>
                <span>Best: {bestScore}</span>
              </div>
            </div>
          )}

          <div className={s.difficultySection}>
            <label className={s.difficultyLabel}>Difficulty</label>
            <div className={s.difficultyButtons}>
              {['easy', 'medium', 'hard'].map((level) => (
                <button
                  key={level}
                  onClick={() => setDifficulty(level)}
                  className={`${s.difficultyButton} ${difficulty === level ? s.difficultyButtonActive : ''}`}
                >
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <button onClick={startGame} className={s.startButton}>
            {isGameOver ? 'Play Again' : 'Start Game'}
          </button>

          <div className={s.instructions}>
            <p className={s.instructionsTitle}>Controls:</p>
            <ul className={s.instructionsList}>
              <li>⌨️ Arrow keys or WASD to move</li>
              <li>📱 Swipe on mobile devices</li>
              <li>⏸️ Space to pause/resume</li>
              <li>💀 Don't hit the walls!</li>
            </ul>
          </div>
        </div>
      ) : (
        <div className={s.gameContainer}>
          <div className={s.infoBar}>
            <div className={s.statsContainer}>
              <div className={s.stat}>
                <p className={s.statLabel}>Score</p>
                <p className={`${s.statValue} ${s.statScore}`}>{score}</p>
              </div>
              <div className={s.stat}>
                <p className={s.statLabel}>Time</p>
                <p className={`${s.statValue} ${s.statTime}`}>{timeLeft}s</p>
              </div>
              <div className={s.stat}>
                <p className={s.statLabel}>Best</p>
                <p className={`${s.statValue} ${s.statBest}`}>{bestScore}</p>
              </div>
            </div>
            <div className={s.gameButtons}>
              <button onClick={togglePause} className={s.pauseButton}>
                {isPaused ? '▶️' : '⏸️'}
              </button>
              <button
                onClick={() => {
                  setIsGameStarted(false);
                  setIsGameOver(false);
                }}
                className={s.exitButton}
              >
                Exit
              </button>
            </div>
          </div>

          <div className={s.boardWrapper}>
            <div
              className={s.board}
              style={{ width: `${COLS * TILE_SIZE}px`, height: `${ROWS * TILE_SIZE}px` }}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
            >
              {snake.map((segment, index) => (
                <div
                  key={index}
                  className={`${s.snake} ${index === 0 ? s.snakeHead : ''}`}
                  style={{
                    left: `${segment.x * TILE_SIZE}px`,
                    top: `${segment.y * TILE_SIZE}px`,
                    width: `${TILE_SIZE}px`,
                    height: `${TILE_SIZE}px`,
                  }}
                />
              ))}

              <div
                className={s.food}
                style={{
                  left: `${food.x * TILE_SIZE}px`,
                  top: `${food.y * TILE_SIZE}px`,
                  width: `${TILE_SIZE}px`,
                  height: `${TILE_SIZE}px`,
                }}
              />

              {isPaused && (
                <div className={s.pauseOverlay}>
                  <div className={s.pauseContent}>
                    <p className={s.pauseTitle}>⏸️ Paused</p>
                    <p className={s.pauseText}>Press Space or Play button</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className={s.mobileControls}>
            <div className={s.controlPad}>
              <button
                onClick={() => handleDirectionClick('n')}
                disabled={direction === 's'}
                className={s.directionButton}
              >
                ↑
              </button>
              <div className={s.horizontalControls}>
                <button
                  onClick={() => handleDirectionClick('w')}
                  disabled={direction === 'e'}
                  className={s.directionButton}
                >
                  ←
                </button>
                <button
                  onClick={() => handleDirectionClick('e')}
                  disabled={direction === 'w'}
                  className={s.directionButton}
                >
                  →
                </button>
              </div>
              <button
                onClick={() => handleDirectionClick('s')}
                disabled={direction === 'n'}
                className={s.directionButton}
              >
                ↓
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function getNextPosition(head, direction) {
  switch (direction) {
    case 'n': return { x: head.x, y: head.y - 1 };
    case 's': return { x: head.x, y: head.y + 1 };
    case 'e': return { x: head.x + 1, y: head.y };
    case 'w': return { x: head.x - 1, y: head.y };
    default: return head;
  }
}

function checkSelfCollision(newHead, snake) {
  return snake.some((segment) => segment.x === newHead.x && segment.y === newHead.y);
}

function generateFood(snake) {
  let foodPosition;
  do {
    foodPosition = {
      x: Math.floor(Math.random() * COLS),
      y: Math.floor(Math.random() * ROWS),
    };
  } while (snake.some((segment) => segment.x === foodPosition.x && segment.y === foodPosition.y));
  return foodPosition;
}

function getDirection(key) {
  const keyMap = {
    ArrowUp: 'n', w: 'n', W: 'n',
    ArrowDown: 's', s: 's', S: 's',
    ArrowLeft: 'w', a: 'w', A: 'w',
    ArrowRight: 'e', d: 'e', D: 'e',
  };
  return keyMap[key] || null;
}

function getOppositeDirection(direction) {
  const opposites = { n: 's', s: 'n', e: 'w', w: 'e' };
  return opposites[direction];
}

export default SnakeGame;
