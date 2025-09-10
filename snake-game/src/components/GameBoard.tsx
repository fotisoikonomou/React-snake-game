import React, { useState, useEffect, useCallback } from 'react';
import { Position, Direction, GameState } from '../types/Game';
import './GameBoard.css';

const BOARD_SIZE = 20;
const INITIAL_SNAKE: Position[] = [{ x: 10, y: 10 }];
const INITIAL_FOOD: Position = { x: 5, y: 5 };

const GameBoard: React.FC = () => {
  // ... (ίδιος κώδικας όπως πριν)
  const [gameState, setGameState] = useState<GameState>({
    snake: INITIAL_SNAKE,
    food: INITIAL_FOOD,
    direction: Direction.RIGHT,
    gameOver: false,
    score: 0
  });

  const generateFood = useCallback((snake: Position[]): Position => {
    let newFood: Position;
    do {
      newFood = {
        x: Math.floor(Math.random() * BOARD_SIZE),
        y: Math.floor(Math.random() * BOARD_SIZE)
      };
    } while (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    return newFood;
  }, []);

  const moveSnake = useCallback(() => {
    setGameState(prevState => {
      if (prevState.gameOver) return prevState;

      const { snake, direction, food, score } = prevState;
      const head = { ...snake[0] };

      switch (direction) {
        case Direction.UP:
          head.y -= 1;
          break;
        case Direction.DOWN:
          head.y += 1;
          break;
        case Direction.LEFT:
          head.x -= 1;
          break;
        case Direction.RIGHT:
          head.x += 1;
          break;
      }

      if (head.x < 0 || head.x >= BOARD_SIZE || head.y < 0 || head.y >= BOARD_SIZE) {
        return { ...prevState, gameOver: true };
      }

      if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
        return { ...prevState, gameOver: true };
      }

      const newSnake = [head, ...snake];

      if (head.x === food.x && head.y === food.y) {
        return {
          ...prevState,
          snake: newSnake,
          food: generateFood(newSnake),
          score: score + 10
        };
      } else {
        newSnake.pop();
        return {
          ...prevState,
          snake: newSnake
        };
      }
    });
  }, [generateFood]);

  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    if (gameState.gameOver) return;

    switch (event.key) {
      case 'ArrowUp':
        if (gameState.direction !== Direction.DOWN) {
          setGameState(prev => ({ ...prev, direction: Direction.UP }));
        }
        break;
      case 'ArrowDown':
        if (gameState.direction !== Direction.UP) {
          setGameState(prev => ({ ...prev, direction: Direction.DOWN }));
        }
        break;
      case 'ArrowLeft':
        if (gameState.direction !== Direction.RIGHT) {
          setGameState(prev => ({ ...prev, direction: Direction.LEFT }));
        }
        break;
      case 'ArrowRight':
        if (gameState.direction !== Direction.LEFT) {
          setGameState(prev => ({ ...prev, direction: Direction.RIGHT }));
        }
        break;
    }
  }, [gameState.direction, gameState.gameOver]);

  const resetGame = () => {
    setGameState({
      snake: INITIAL_SNAKE,
      food: INITIAL_FOOD,
      direction: Direction.RIGHT,
      gameOver: false,
      score: 0
    });
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);

  useEffect(() => {
    const gameInterval = setInterval(moveSnake, 150);
    return () => clearInterval(gameInterval);
  }, [moveSnake]);

  const renderCell = (x: number, y: number) => {
    const isSnake = gameState.snake.some(segment => segment.x === x && segment.y === y);
    const isFood = gameState.food.x === x && gameState.food.y === y;
    const isHead = gameState.snake[0]?.x === x && gameState.snake[0]?.y === y;

    let className = 'cell';
    if (isSnake) className += isHead ? ' snake-head' : ' snake-body';
    if (isFood) className += ' food';

    return <div key={`${x}-${y}`} className={className} />;
  };

  return (
    <div className="game-container">
      <div className="game-header">
        <h1>🐍 Snake Game</h1>
        <div className="score">Score: {gameState.score}</div>
      </div>
      
      <div className="game-board">
        {Array.from({ length: BOARD_SIZE }, (_, y) =>
          Array.from({ length: BOARD_SIZE }, (_, x) => renderCell(x, y))
        )}
      </div>

      {gameState.gameOver && (
        <div className="game-over">
          <h2>Game Over!</h2>
          <p>Final Score: {gameState.score}</p>
          <button onClick={resetGame}>Play Again</button>
        </div>
      )}

      <div className="controls">
        <p>Use arrow keys to control the snake</p>
        <button onClick={resetGame}>Reset Game</button>
      </div>
    </div>
  );
};

export default GameBoard;
