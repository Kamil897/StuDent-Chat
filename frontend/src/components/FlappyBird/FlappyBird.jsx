import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom'; 
import s from './FlappyBird.module.scss';
import MyTituls from '../MyTituls/MyTituls'; // Импортируем функцию для получения титулов
import { saveGameProgress } from '../utils/gamesApi';

const FlappyBird = ({ isMenuOpen, isGameOver, restartGame, goToMenu, canvasRef }) => {
  const navigate = useNavigate();
  
  const [score, setScore] = useState(0);  // Состояние для хранения счёта
  const [title, setTitle] = useState(null);  // Состояние для титула
  const [gameOver, setGameOver] = useState(isGameOver);  // Состояние для флага окончания игры

  useEffect(() => {
    // Получаем титул по текущему счёту
    const newTitle = MyTituls(score);
    if (newTitle !== title) {
      setTitle(newTitle);  // Обновляем титул
    }
  }, [score, title]);

  const handleFlap = () => {
    if (!gameOver) {
      setScore(prevScore => prevScore + 1);  // Увеличиваем счёт при каждом флапе
    }
  };

  const initGame = async () => {
    await Pipe.preloadImages();
    await Ground.preloadImage();
    await Bird.preloadImage();
    // Инициализация игровых объектов
    const ground = new Ground(canvasRef.current);
    const bird = new Bird(canvasRef.current);
    const pipes = [];
    
    const frameRate = 1000 / 60; // 60 FPS
    let frameId;

    const update = () => {
      const ctx = canvasRef.current.getContext('2d');
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      
      ground.update();
      bird.update();
      
      if (gameOver) {
        // Логика окончания игры
        cancelAnimationFrame(frameId);
        return;
      }
      
      // Добавление новых труб
      if (Math.random() < 0.01) {
        pipes.push(new Pipe(canvasRef.current));
      }

      pipes.forEach((pipe, index) => {
        pipe.update();
        if (pipe.isOffscreen()) {
          pipes.splice(index, 1);
        }
      });

      // Проверка на столкновения
      if (checkCollision(bird, pipes, ground)) {
        setGameOver(true);
        // Сохраняем прогресс в backend при проигрыше
        saveGameProgress('flappybird', {
          score: score,
          level: Math.floor(score / 10) + 1,
          timeSpent: 0,
          completed: false
        });
      }

      frameId = requestAnimationFrame(update);
    };

    update();
  };

  useEffect(() => {
    if (isMenuOpen) {
      initGame();
    }
  }, [isMenuOpen]);

  return (
    <section className={s.flappyBird}>
      <canvas ref={canvasRef} width="400" height="600" onClick={handleFlap} />
      {gameOver && (
        <div className={s.gameOver}>
          <h2>Игра окончена</h2>
          <button onClick={() => navigate('/')} className={s.retryButton}>Попробовать снова</button>
        </div>
      )}
      {title && !gameOver && (
        <div className={s.title}>
          <h2>Ваш титул: {title}</h2>  {/* Показываем титул игрока */}
        </div>
      )}
    </section>
  );
};

export default FlappyBird;
