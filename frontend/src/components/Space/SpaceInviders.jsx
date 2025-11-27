import { useRef, useEffect, useState } from 'react';

// Game Constants
const PLAYER_WIDTH = 50;
const PLAYER_HEIGHT = 30;
const ENEMY_WIDTH = 35;
const ENEMY_HEIGHT = 35;
const BULLET_WIDTH = 4;
const BULLET_HEIGHT = 12;
const ENEMY_BULLET_WIDTH = 3;
const ENEMY_BULLET_HEIGHT = 10;
const SHOOT_COOLDOWN = 250;
const PLAYER_SPEED = 7;
const BULLET_SPEED = 10;
const ENEMY_BULLET_SPEED = 5;
const INITIAL_ENEMY_SPEED = 1;
const ENEMY_DROP_DISTANCE = 15;
const POINTS_PER_ENEMY = 10;
const ENEMY_SHOOT_CHANCE = 0.001;
const INITIAL_LIVES = 3;

function SpaceInvaders() {
  const canvasRef = useRef(null);
  const [gameState, setGameState] = useState('playing');
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(INITIAL_LIVES);
  const [wave, setWave] = useState(1);
  const gameStateRef = useRef({
    canShoot: true,
    keys: {},
    bullets: [],
    enemyBullets: [],
    enemies: [],
    enemyDX: INITIAL_ENEMY_SPEED,
    animationId: null,
    score: 0,
    lives: INITIAL_LIVES,
    wave: 1,
    stars: [],
    particles: [],
    enemyAnimationFrame: 0,
    invincible: false
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();

    const state = gameStateRef.current;

    // Initialize stars
    state.stars = Array.from({ length: 100 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2,
      speed: Math.random() * 0.5 + 0.2
    }));

    // Initialize player
    const player = {
      x: canvas.width / 2 - PLAYER_WIDTH / 2,
      y: canvas.height - 80,
      w: PLAYER_WIDTH,
      h: PLAYER_HEIGHT,
      speed: PLAYER_SPEED,
    };

    // Create particle explosion
    const createExplosion = (x, y, color) => {
      for (let i = 0; i < 15; i++) {
        const angle = (Math.PI * 2 * i) / 15;
        state.particles.push({
          x,
          y,
          vx: Math.cos(angle) * (Math.random() * 3 + 2),
          vy: Math.sin(angle) * (Math.random() * 3 + 2),
          life: 1,
          color
        });
      }
    };

    // Initialize enemies with types
    const initEnemies = (waveNum) => {
      state.enemies = [];
      const rows = Math.min(4 + Math.floor(waveNum / 3), 6);
      const cols = Math.floor(canvas.width / 70);
      
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          let type = 'basic';
          let hp = 1;
          let color = '#ff2e63';
          
          // Different enemy types based on row
          if (row === 0 && waveNum >= 2) {
            type = 'tank';
            hp = 3;
            color = '#ff6b00';
          } else if (row === rows - 1 && waveNum >= 3) {
            type = 'fast';
            color = '#00d4ff';
          } else if (waveNum >= 4 && Math.random() > 0.7) {
            type = 'shooter';
            color = '#ff00ff';
          }
          
          state.enemies.push({
            x: 30 + col * 70,
            y: 50 + row * 50,
            w: ENEMY_WIDTH,
            h: ENEMY_HEIGHT,
            alive: true,
            type,
            maxHp: hp,
            hp,
            color,
            shootTimer: Math.random() * 200
          });
        }
      }
      state.enemyDX = INITIAL_ENEMY_SPEED + (waveNum * 0.3);
    };

    initEnemies(state.wave);

    // Handle player movement
    const handleKeys = () => {
      if (state.keys['ArrowLeft'] || state.keys['a'] || state.keys['A']) {
        player.x -= player.speed;
      }
      if (state.keys['ArrowRight'] || state.keys['d'] || state.keys['D']) {
        player.x += player.speed;
      }
      player.x = Math.max(0, Math.min(canvas.width - player.w, player.x));
    };

    // Shoot bullet
    const shoot = () => {
      if (!state.canShoot) return;
      
      state.bullets.push({
        x: player.x + player.w / 2 - BULLET_WIDTH / 2,
        y: player.y,
        w: BULLET_WIDTH,
        h: BULLET_HEIGHT,
        hit: false
      });
      
      state.canShoot = false;
      setTimeout(() => {
        state.canShoot = true;
      }, SHOOT_COOLDOWN);
    };

    // Enemy shooting
    const enemyShoot = () => {
      state.enemies.forEach(enemy => {
        if (!enemy.alive) return;
        
        if (enemy.type === 'shooter') {
          enemy.shootTimer--;
          if (enemy.shootTimer <= 0) {
            state.enemyBullets.push({
              x: enemy.x + enemy.w / 2 - ENEMY_BULLET_WIDTH / 2,
              y: enemy.y + enemy.h,
              w: ENEMY_BULLET_WIDTH,
              h: ENEMY_BULLET_HEIGHT
            });
            enemy.shootTimer = 100 + Math.random() * 100;
          }
        } else if (Math.random() < ENEMY_SHOOT_CHANCE) {
          state.enemyBullets.push({
            x: enemy.x + enemy.w / 2 - ENEMY_BULLET_WIDTH / 2,
            y: enemy.y + enemy.h,
            w: ENEMY_BULLET_WIDTH,
            h: ENEMY_BULLET_HEIGHT
          });
        }
      });
    };

    // Update player bullets
    const updateBullets = () => {
      state.bullets = state.bullets.filter(b => b.y > 0 && !b.hit);
      
      state.bullets.forEach(bullet => {
        bullet.y -= BULLET_SPEED;
        
        for (let i = 0; i < state.enemies.length; i++) {
          const enemy = state.enemies[i];
          if (!enemy.alive) continue;
          
          if (
            bullet.x < enemy.x + enemy.w &&
            bullet.x + bullet.w > enemy.x &&
            bullet.y < enemy.y + enemy.h &&
            bullet.y + bullet.h > enemy.y
          ) {
            enemy.hp--;
            bullet.hit = true;
            
            if (enemy.hp <= 0) {
              enemy.alive = false;
              state.score += POINTS_PER_ENEMY * (enemy.type === 'tank' ? 3 : enemy.type === 'shooter' ? 2 : 1);
              setScore(state.score);
              createExplosion(enemy.x + enemy.w / 2, enemy.y + enemy.h / 2, enemy.color);
            }
            break;
          }
        }
      });

      // Check win condition
      const allEnemiesDead = state.enemies.every(e => !e.alive);
      if (allEnemiesDead) {
        state.wave++;
        setWave(state.wave);
        initEnemies(state.wave);
      }
    };

    // Update enemy bullets
    const updateEnemyBullets = () => {
      state.enemyBullets = state.enemyBullets.filter(b => b.y < canvas.height);
      
      state.enemyBullets.forEach(bullet => {
        bullet.y += ENEMY_BULLET_SPEED;
        
        // Check collision with player
        if (
          !state.invincible &&
          bullet.x < player.x + player.w &&
          bullet.x + bullet.w > player.x &&
          bullet.y < player.y + player.h &&
          bullet.y + bullet.h > player.y
        ) {
          bullet.y = canvas.height + 100; // Remove bullet
          state.lives--;
          setLives(state.lives);
          createExplosion(player.x + player.w / 2, player.y + player.h / 2, '#00ff99');
          
          if (state.lives <= 0) {
            cancelAnimationFrame(state.animationId);
            setGameState('lose');
          } else {
            // Temporary invincibility
            state.invincible = true;
            setTimeout(() => {
              state.invincible = false;
            }, 2000);
          }
        }
      });
    };

    // Move enemies
    const moveEnemies = () => {
      let hitEdge = false;
      
      state.enemies.forEach(enemy => {
        if (!enemy.alive) return;
        
        const speedMultiplier = enemy.type === 'fast' ? 1.5 : 1;
        enemy.x += state.enemyDX * speedMultiplier;
        
        if (enemy.x <= 0 || enemy.x + enemy.w >= canvas.width) {
          hitEdge = true;
        }
        
        if (enemy.y + enemy.h >= player.y - 10 && enemy.alive) {
          cancelAnimationFrame(state.animationId);
          setGameState('lose');
        }
      });
      
      if (hitEdge) {
        state.enemyDX *= -1;
        state.enemyDX *= 1.03; // Speed up
        state.enemies.forEach(enemy => {
          enemy.y += ENEMY_DROP_DISTANCE;
        });
      }
    };

    // Update particles
    const updateParticles = () => {
      state.particles = state.particles.filter(p => p.life > 0);
      state.particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.1; // Gravity
        p.life -= 0.02;
      });
    };

    // Draw everything
    const draw = () => {
      // Clear canvas
      ctx.fillStyle = '#0a0a1a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw stars
      state.stars.forEach(star => {
        star.y += star.speed;
        if (star.y > canvas.height) star.y = 0;
        
        ctx.fillStyle = `rgba(255, 255, 255, ${star.size / 2})`;
        ctx.fillRect(star.x, star.y, star.size, star.size);
      });

      // Draw player with pulsing effect when invincible
      if (!state.invincible || Math.floor(Date.now() / 100) % 2 === 0) {
        ctx.fillStyle = '#00ff99';
        ctx.fillRect(player.x, player.y, player.w, player.h);
        ctx.fillStyle = '#00cc77';
        ctx.fillRect(player.x + 8, player.y + 8, player.w - 16, player.h - 16);
        // Cockpit
        ctx.fillStyle = '#00ffff';
        ctx.fillRect(player.x + player.w / 2 - 5, player.y + 5, 10, 8);
      }

      // Draw player bullets
      ctx.fillStyle = '#ffffff';
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#00ffff';
      state.bullets.forEach(bullet => {
        ctx.fillRect(bullet.x, bullet.y, bullet.w, bullet.h);
      });
      ctx.shadowBlur = 0;

      // Draw enemy bullets
      ctx.fillStyle = '#ff00ff';
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#ff00ff';
      state.enemyBullets.forEach(bullet => {
        ctx.fillRect(bullet.x, bullet.y, bullet.w, bullet.h);
      });
      ctx.shadowBlur = 0;

      // Animate enemies
      state.enemyAnimationFrame = (state.enemyAnimationFrame + 0.05) % 1;
      const bounce = Math.sin(state.enemyAnimationFrame * Math.PI * 2) * 3;

      // Draw enemies with different designs
      state.enemies.forEach((enemy, idx) => {
        if (!enemy.alive) return;
        
        const animOffset = Math.sin((state.enemyAnimationFrame + idx * 0.1) * Math.PI * 2) * 2;
        
        ctx.fillStyle = enemy.color;
        
        if (enemy.type === 'tank') {
          // Tank enemy - larger and bulkier
          ctx.fillRect(enemy.x, enemy.y + bounce, enemy.w, enemy.h);
          ctx.fillStyle = '#ff9933';
          ctx.fillRect(enemy.x + 5, enemy.y + 5 + bounce, enemy.w - 10, enemy.h - 10);
          // Show HP
          for (let i = 0; i < enemy.hp; i++) {
            ctx.fillRect(enemy.x + 8 + i * 8, enemy.y + 2, 5, 3);
          }
        } else if (enemy.type === 'fast') {
          // Fast enemy - sleek design
          ctx.beginPath();
          ctx.moveTo(enemy.x + enemy.w / 2, enemy.y + bounce);
          ctx.lineTo(enemy.x + enemy.w, enemy.y + enemy.h + bounce);
          ctx.lineTo(enemy.x, enemy.y + enemy.h + bounce);
          ctx.closePath();
          ctx.fill();
        } else if (enemy.type === 'shooter') {
          // Shooter enemy - with guns
          ctx.fillRect(enemy.x, enemy.y + bounce, enemy.w, enemy.h);
          ctx.fillStyle = '#ff66ff';
          ctx.fillRect(enemy.x + 5, enemy.y + 5 + bounce, enemy.w - 10, enemy.h - 10);
          // Guns
          ctx.fillStyle = enemy.color;
          ctx.fillRect(enemy.x - 3, enemy.y + enemy.h - 5 + bounce, 5, 8);
          ctx.fillRect(enemy.x + enemy.w - 2, enemy.y + enemy.h - 5 + bounce, 5, 8);
        } else {
          // Basic enemy
          ctx.fillRect(enemy.x, enemy.y + bounce + animOffset, enemy.w, enemy.h);
          ctx.fillStyle = '#ff5588';
          ctx.fillRect(enemy.x + 5, enemy.y + 5 + bounce + animOffset, enemy.w - 10, enemy.h - 10);
        }
      });

      // Draw particles
      state.particles.forEach(p => {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life;
        ctx.fillRect(p.x - 2, p.y - 2, 4, 4);
      });
      ctx.globalAlpha = 1;

      // Draw HUD
      ctx.fillStyle = '#00ff99';
      ctx.font = 'bold 24px monospace';
      ctx.fillText(`Score: ${state.score}`, 20, 35);
      
      ctx.fillStyle = '#00d4ff';
      ctx.fillText(`Wave: ${state.wave}`, 20, 65);
      
      // Draw lives as hearts
      ctx.font = '28px Arial';
      for (let i = 0; i < state.lives; i++) {
        ctx.fillText('❤️', canvas.width - 50 - i * 40, 40);
      }
      
      // Enemy count
      const aliveCount = state.enemies.filter(e => e.alive).length;
      ctx.fillStyle = '#ff2e63';
      ctx.font = '18px monospace';
      ctx.fillText(`Enemies: ${aliveCount}`, 20, 95);
    };

    // Main game loop
    const gameLoop = () => {
      handleKeys();
      moveEnemies();
      enemyShoot();
      updateBullets();
      updateEnemyBullets();
      updateParticles();
      draw();
      state.animationId = requestAnimationFrame(gameLoop);
    };

    // Event handlers
    const handleKeyDown = (e) => {
      state.keys[e.key] = true;
      
      if (e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        shoot();
      }
    };

    const handleKeyUp = (e) => {
      state.keys[e.key] = false;
    };

    const handleResize = () => {
      const oldWidth = canvas.width;
      resizeCanvas();
      const scale = canvas.width / oldWidth;
      player.x = Math.min(player.x * scale, canvas.width - player.w);
      player.y = canvas.height - 80;
      
      state.enemies.forEach(e => {
        e.x *= scale;
      });
    };

    // Add event listeners
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('resize', handleResize);

    // Start game loop
    gameLoop();

    // Cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('resize', handleResize);
      if (state.animationId) {
        cancelAnimationFrame(state.animationId);
      }
    };
  }, []);

  const restartGame = () => {
    window.location.reload();
  };

  const simulateKey = (key, pressed = true) => {
    const event = new KeyboardEvent(pressed ? 'keydown' : 'keyup', { 
      key,
      bubbles: true 
    });
    window.dispatchEvent(event);
  };

  return (
    <div style={{
      position: 'relative',
      width: '100vw',
      height: '100vh',
      overflow: 'hidden',
      background: '#0a0a1a',
      userSelect: 'none'
    }}>
      {gameState !== 'playing' && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(10, 10, 26, 0.95)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10,
          padding: '1rem',
          boxSizing: 'border-box'
        }}>
          <h1 style={{
            color: gameState === 'win' ? '#00ff99' : '#ff2e63',
            fontSize: 'clamp(2.5rem, 8vw, 4rem)',
            marginBottom: '1rem',
            textAlign: 'center',
            textShadow: `0 0 30px ${gameState === 'win' ? '#00ff99' : '#ff2e63'}`,
            animation: 'pulse 1s infinite'
          }}>
            {gameState === 'win' ? '🎉 VICTORY!' : '💥 GAME OVER'}
          </h1>
          
          <div style={{
            color: '#fff',
            fontSize: '1.8rem',
            marginBottom: '1rem',
            textShadow: '0 0 10px rgba(255,255,255,0.5)'
          }}>
            Final Score: <span style={{ color: '#00ff99' }}>{score}</span>
          </div>

          <div style={{
            color: '#00d4ff',
            fontSize: '1.4rem',
            marginBottom: '2.5rem'
          }}>
            Reached Wave: {wave}
          </div>

          <button 
            onClick={restartGame}
            style={{
              padding: '1rem 3rem',
              backgroundColor: '#00ff99',
              border: 'none',
              borderRadius: '12px',
              fontSize: '1.5rem',
              color: '#000',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              fontWeight: 'bold',
              boxShadow: '0 0 30px rgba(0, 255, 153, 0.6)',
              textTransform: 'uppercase'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#00cc77';
              e.target.style.transform = 'scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#00ff99';
              e.target.style.transform = 'scale(1)';
            }}
          >
            🎮 Play Again
          </button>
        </div>
      )}

      <canvas 
        ref={canvasRef}
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
          touchAction: 'none'
        }}
      />

      {/* Mobile Controls */}
      <div style={{
        position: 'absolute',
        bottom: '1.5rem',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: '1.2rem',
        zIndex: 5
      }}>
        <button
          onTouchStart={() => simulateKey('ArrowLeft', true)}
          onTouchEnd={() => simulateKey('ArrowLeft', false)}
          onMouseDown={() => simulateKey('ArrowLeft', true)}
          onMouseUp={() => simulateKey('ArrowLeft', false)}
          onMouseLeave={() => simulateKey('ArrowLeft', false)}
          style={{
            width: '65px',
            height: '65px',
            fontSize: '2rem',
            background: 'rgba(0, 255, 153, 0.25)',
            border: '3px solid #00ff99',
            borderRadius: '50%',
            color: '#00ff99',
            backdropFilter: 'blur(8px)',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            touchAction: 'none',
            boxShadow: '0 0 20px rgba(0, 255, 153, 0.4)'
          }}
        >
          ◀
        </button>

        <button
          onTouchStart={() => simulateKey(' ')}
          onClick={() => simulateKey(' ')}
          style={{
            width: '70px',
            height: '70px',
            fontSize: '2rem',
            background: 'rgba(255, 50, 100, 0.3)',
            border: '3px solid #ff2e63',
            borderRadius: '50%',
            color: '#ff2e63',
            backdropFilter: 'blur(8px)',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            touchAction: 'none',
            boxShadow: '0 0 25px rgba(255, 46, 99, 0.5)',
            fontWeight: 'bold'
          }}
        >
          🔥
        </button>

        <button
          onTouchStart={() => simulateKey('ArrowRight', true)}
          onTouchEnd={() => simulateKey('ArrowRight', false)}
          onMouseDown={() => simulateKey('ArrowRight', true)}
          onMouseUp={() => simulateKey('ArrowRight', false)}
          onMouseLeave={() => simulateKey('ArrowRight', false)}
          style={{
            width: '65px',
            height: '65px',
            fontSize: '2rem',
            background: 'rgba(0, 255, 153, 0.25)',
            border: '3px solid #00ff99',
            borderRadius: '50%',
            color: '#00ff99',
            backdropFilter: 'blur(8px)',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            touchAction: 'none',
            boxShadow: '0 0 20px rgba(0, 255, 153, 0.4)'
          }}
        >
          ▶
        </button>
      </div>

      {/* Instructions */}
      {gameState === 'playing' && (
        <div style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          color: '#00ff99',
          fontSize: '14px',
          fontFamily: 'monospace',
          textAlign: 'right',
          opacity: 0.8,
          background: 'rgba(0, 0, 0, 0.5)',
          padding: '10px',
          borderRadius: '8px',
          border: '1px solid #00ff99'
        }}>
          <div style={{ marginBottom: '5px' }}>⬅️ ➡️ or A/D: Move</div>
          <div>⎵ SPACE: Shoot</div>
        </div>
      )}
    </div>
  );
}

export default SpaceInvaders;