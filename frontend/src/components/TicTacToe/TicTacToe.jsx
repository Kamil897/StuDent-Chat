import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './TicTacToe.module.scss';
import { useUser } from '../../Context/UserContext';
import { useTranslation } from 'react-i18next';
import { saveGameProgress } from '../utils/gamesApi';

const TicTacToe = () => {
  const { addPoints } = useUser();
  const { t } = useTranslation(); // без namespace
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [winner, setWinner] = useState(null);
  const [isVsComputer, setIsVsComputer] = useState(true);
  const [playerSymbol, setPlayerSymbol] = useState('X');
  const [showSelection, setShowSelection] = useState(true);
  const [gameState, setGameState] = useState(null);

  const checkWinner = (squares) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6],
    ];
    for (let [a, b, c] of lines) {
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    return null;
  };

  const getBestMove = (squares, computerSymbol) => {
    const playerSymbol = computerSymbol === 'X' ? 'O' : 'X';
    const isWinningMove = (symbol) => {
      for (let i = 0; i < squares.length; i++) {
        if (squares[i] === null) {
          const tempBoard = squares.slice();
          tempBoard[i] = symbol;
          if (checkWinner(tempBoard) === symbol) return i;
        }
      }
      return null;
    };

    const win = isWinningMove(computerSymbol);
    if (win !== null) return win;

    const block = isWinningMove(playerSymbol);
    if (block !== null) return block;

    if (squares[4] === null) return 4;

    const corners = [0, 2, 6, 8].filter(i => squares[i] === null);
    if (corners.length > 0) return corners[Math.floor(Math.random() * corners.length)];

    const others = squares.map((s, i) => s === null ? i : null).filter(i => i !== null);
    return others[Math.floor(Math.random() * others.length)];
  };

  const computerMove = (squares) => {
    const computerSymbol = playerSymbol === 'X' ? 'O' : 'X';
    const move = getBestMove(squares, computerSymbol);
    if (move !== null) {
      setTimeout(() => {
        const updated = [...squares];
        updated[move] = computerSymbol;
        setBoard(updated);
        const gameWinner = checkWinner(updated);
            if (gameWinner) {
      setWinner(gameWinner);
      setGameState(gameWinner === playerSymbol ? 'win' : 'lose');
      if (gameWinner === playerSymbol) {
        addPoints(100);
        // Сохраняем прогресс в backend
        saveGameProgress('tictactoe', {
          score: 100,
          level: 1,
          timeSpent: 0,
          completed: true
        });
      }
    } else if (!updated.includes(null)) {
      setGameState('draw');
    } else {
      setIsXNext(true);
    }
      }, 500);
    }
  };

  const handleClick = (index) => {
    if (board[index] || winner || !isXNext) return;
    const updated = [...board];
    updated[index] = playerSymbol;
    setBoard(updated);
    const gameWinner = checkWinner(updated);
    if (gameWinner) {
      setWinner(gameWinner);
      setGameState('win');
      if (gameWinner === playerSymbol) {
        addPoints(100);
        // Сохраняем прогресс в backend
        saveGameProgress('tictactoe', {
          score: 100,
          level: 1,
          timeSpent: 0,
          completed: true
        });
      }
    } else if (isVsComputer) {
      setIsXNext(false);
      computerMove(updated);
    } else {
      setIsXNext(!isXNext);
    }
  };

  const renderSquare = (i) => (
    <div className={`${styles.square} ${board[i] ? styles.occupied : ''}`} onClick={() => handleClick(i)}>
      {board[i] && (
        <div className={`${styles.symbol} ${board[i] === 'X' ? styles.x : styles.o}`}>
          {board[i]}
        </div>
      )}
    </div>
  );

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setWinner(null);
    setGameState(null);
  };

  const selectSymbol = (symbol) => {
    setPlayerSymbol(symbol);
    setShowSelection(false);
  };

  return (
    <div className={styles['tic-tac-toe']}>
      {showSelection ? (
        <div className={styles.SelectionMenu}>
          <h1>{t("tictactoe.chooseSymbol")}</h1>
          <div className={styles.symbolButtons}>
            <button onClick={() => selectSymbol('X')} className={styles.symbolButton}>X</button>
            <p>{t("tictactoe.or")}</p>
            <button onClick={() => selectSymbol('O')} className={styles.symbolButton}>O</button>
          </div>
        </div>
      ) : (
        <>
          <div className={styles['turn-indicator']}>
            <div className={styles['turn-message']}>
              {isXNext
                ? t(playerSymbol === 'X' ? "tictactoe.turn.playerX" : "tictactoe.turn.playerO")
                : t("tictactoe.turn.computer")}
            </div>
          </div>
          <div className={styles.board}>
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className={styles['square-container']}>
                {renderSquare(i)}
              </div>
            ))}
          </div>
          {gameState && (
            <div className={`${styles.menu} ${styles.centeredMenu} ${styles.visible}`}>
              <div className={styles['menu-header']}>
                <h2 className={styles['menu-title']}>
                  {gameState === 'win' && t("tictactoe.result.win")}
                  {gameState === 'lose' && t("tictactoe.result.lose")}
                  {gameState === 'draw' && t("tictactoe.result.draw")}
                </h2>
              </div>
              <button className={styles['menu-button']} onClick={resetGame}>
                {t("tictactoe.playAgain")}
              </button>
              <button className={styles['menu-button']} onClick={() => setShowSelection(true)}>
                {t("tictactoe.changeSymbol")}
              </button>
              <Link to="/Games">
                <button className={styles['menu-button']}>
                  {t("tictactoe.exit")}
                </button>
              </Link>
            </div>
          )}
          {!gameState && (
            <button className={styles['reset-button']} onClick={resetGame}>
              {t("tictactoe.reset")}
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default TicTacToe;
