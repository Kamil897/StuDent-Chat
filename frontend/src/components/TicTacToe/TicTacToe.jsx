import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import styles from './TicTacToe.module.scss';
import { useUser } from '../../Context/UserContext';
import { useTranslation } from 'react-i18next';
import { saveGameProgress } from '../utils/gamesApi';

const WINNING_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
  [0, 4, 8], [2, 4, 6],             // Diagonals
];

const TicTacToe = () => {
  const { addPoints } = useUser();
  const { t } = useTranslation();
  
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [gameState, setGameState] = useState(null); // null, 'win', 'lose', 'draw'
  const [playerSymbol, setPlayerSymbol] = useState('X');
  const [showSelection, setShowSelection] = useState(true);
  const [winningLine, setWinningLine] = useState(null);

  const computerSymbol = playerSymbol === 'X' ? 'O' : 'X';

  // Check for winner and return both winner and winning line
  const checkWinner = useCallback((squares) => {
    for (let line of WINNING_LINES) {
      const [a, b, c] = line;
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return { winner: squares[a], line };
      }
    }
    return { winner: null, line: null };
  }, []);

  // Check if board is full (draw)
  const isBoardFull = (squares) => squares.every(square => square !== null);

  // Get best move for computer using minimax-inspired strategy
  const getBestMove = useCallback((squares) => {
    // Check if move wins
    const findWinningMove = (symbol) => {
      for (let i = 0; i < squares.length; i++) {
        if (squares[i] === null) {
          const tempBoard = [...squares];
          tempBoard[i] = symbol;
          if (checkWinner(tempBoard).winner === symbol) return i;
        }
      }
      return null;
    };

    // 1. Try to win
    const winMove = findWinningMove(computerSymbol);
    if (winMove !== null) return winMove;

    // 2. Block player's winning move
    const blockMove = findWinningMove(playerSymbol);
    if (blockMove !== null) return blockMove;

    // 3. Take center if available
    if (squares[4] === null) return 4;

    // 4. Take corners
    const corners = [0, 2, 6, 8].filter(i => squares[i] === null);
    if (corners.length > 0) {
      return corners[Math.floor(Math.random() * corners.length)];
    }

    // 5. Take any remaining space
    const available = squares
      .map((square, i) => square === null ? i : null)
      .filter(i => i !== null);
    
    return available.length > 0 
      ? available[Math.floor(Math.random() * available.length)] 
      : null;
  }, [computerSymbol, playerSymbol, checkWinner]);

  // Handle game end
  const handleGameEnd = useCallback((winner, updatedBoard, line = null) => {
    if (winner) {
      setWinningLine(line);
      if (winner === playerSymbol) {
        setGameState('win');
        addPoints(100);
        saveGameProgress('tictactoe', {
          score: 100,
          level: 1,
          timeSpent: 0,
          completed: true
        }).catch(err => console.error('Failed to save progress:', err));
      } else {
        setGameState('lose');
      }
    } else if (isBoardFull(updatedBoard)) {
      setGameState('draw');
    }
  }, [playerSymbol, addPoints]);

  // Computer makes a move
  const makeComputerMove = useCallback((squares) => {
    const move = getBestMove(squares);
    if (move !== null) {
      setTimeout(() => {
        const updatedBoard = [...squares];
        updatedBoard[move] = computerSymbol;
        setBoard(updatedBoard);
        
        const { winner, line } = checkWinner(updatedBoard);
        handleGameEnd(winner, updatedBoard, line);
        setIsXNext(true);
      }, 500);
    }
  }, [getBestMove, computerSymbol, checkWinner, handleGameEnd]);

  // Handle player click
  const handleClick = (index) => {
    // Prevent clicks if game is over, square is occupied, or it's computer's turn
    if (gameState || board[index] || !isXNext) return;

    const updatedBoard = [...board];
    updatedBoard[index] = playerSymbol;
    setBoard(updatedBoard);

    const { winner, line } = checkWinner(updatedBoard);
    
    if (winner || isBoardFull(updatedBoard)) {
      handleGameEnd(winner, updatedBoard, line);
    } else {
      setIsXNext(false);
      makeComputerMove(updatedBoard);
    }
  };

  // Render individual square
  const renderSquare = (i) => {
    const isWinningSquare = winningLine && winningLine.includes(i);
    
    return (
      <div 
        className={`${styles.square} ${board[i] ? styles.occupied : ''} ${isWinningSquare ? styles.winning : ''}`} 
        onClick={() => handleClick(i)}
        role="button"
        tabIndex={0}
        aria-label={`Square ${i + 1}${board[i] ? `, ${board[i]}` : ', empty'}`}
      >
        {board[i] && (
          <div className={`${styles.symbol} ${board[i] === 'X' ? styles.x : styles.o}`}>
            {board[i]}
          </div>
        )}
      </div>
    );
  };

  // Reset game to initial state
  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setGameState(null);
    setWinningLine(null);
  };

  // Select symbol and start game
  const selectSymbol = (symbol) => {
    setPlayerSymbol(symbol);
    setShowSelection(false);
    
    // If player chose O, computer goes first
    if (symbol === 'O') {
      setIsXNext(false);
      setTimeout(() => {
        const firstMove = 4; // Computer takes center
        const updatedBoard = Array(9).fill(null);
        updatedBoard[firstMove] = 'X';
        setBoard(updatedBoard);
        setIsXNext(true);
      }, 500);
    }
  };

  // Change symbol and reset game
  const changeSymbol = () => {
    setShowSelection(true);
    resetGame();
  };

  return (
    <div className={styles['tic-tac-toe']}>
      {showSelection ? (
        <div className={styles.SelectionMenu}>
          <h1>{t("tictactoe.chooseSymbol")}</h1>
          <div className={styles.symbolButtons}>
            <button 
              onClick={() => selectSymbol('X')} 
              className={styles.symbolButton}
              aria-label="Choose X"
            >
              X
            </button>
            <p>{t("tictactoe.or")}</p>
            <button 
              onClick={() => selectSymbol('O')} 
              className={styles.symbolButton}
              aria-label="Choose O"
            >
              O
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className={styles['turn-indicator']}>
            <div className={`${styles['turn-message']} ${gameState ? styles[gameState] : ''}`}>
              {gameState ? (
                <>
                  {gameState === 'win' && t("tictactoe.result.win")}
                  {gameState === 'lose' && t("tictactoe.result.lose")}
                  {gameState === 'draw' && t("tictactoe.result.draw")}
                </>
              ) : (
                <>
                  {isXNext
                    ? t(playerSymbol === 'X' ? "tictactoe.turn.playerX" : "tictactoe.turn.playerO")
                    : t("tictactoe.turn.computer")}
                </>
              )}
            </div>
          </div>

          <div className={styles.board}>
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className={styles['square-container']}>
                {renderSquare(i)}
              </div>
            ))}
          </div>

          {gameState ? (
            <div className={`${styles.menu} ${styles.centeredMenu} ${styles.visible}`}>
              <div className={styles['menu-header']}>
                <h2 className={styles['menu-title']}>
                  {gameState === 'win' && '🎉 ' + t("tictactoe.result.win")}
                  {gameState === 'lose' && '😔 ' + t("tictactoe.result.lose")}
                  {gameState === 'draw' && '🤝 ' + t("tictactoe.result.draw")}
                </h2>
              </div>
              <button className={styles['menu-button']} onClick={resetGame}>
                {t("tictactoe.playAgain")}
              </button>
              <button className={styles['menu-button']} onClick={changeSymbol}>
                {t("tictactoe.changeSymbol")}
              </button>
              <Link to="/Games">
                <button className={styles['menu-button']}>
                  {t("tictactoe.exit")}
                </button>
              </Link>
            </div>
          ) : (
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