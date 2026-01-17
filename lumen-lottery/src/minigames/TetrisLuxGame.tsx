// Tetris Lux Game
// Clearing lines = brightness increase!
// Developer: Lumen Lottery Team

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Dimensions, PanResponder, TouchableOpacity } from 'react-native';
import { MinigameProps } from '../types/Minigame';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;

// Calculate cell size to fit everything on screen
const AVAILABLE_HEIGHT = SCREEN_HEIGHT - 280; // Leave room for header and controls
const AVAILABLE_WIDTH = SCREEN_WIDTH - 100; // Leave room for next piece preview
const CELL_SIZE = Math.min(
  Math.floor(AVAILABLE_WIDTH / BOARD_WIDTH),
  Math.floor(AVAILABLE_HEIGHT / BOARD_HEIGHT)
);
const GAME_BOARD_WIDTH = CELL_SIZE * BOARD_WIDTH;
const GAME_BOARD_HEIGHT = CELL_SIZE * BOARD_HEIGHT;

// Tetromino shapes and their rotations
const TETROMINOES: { [key: string]: { shape: number[][]; color: string } } = {
  I: {
    shape: [[1, 1, 1, 1]],
    color: '#00f5ff',
  },
  O: {
    shape: [
      [1, 1],
      [1, 1],
    ],
    color: '#ffd700',
  },
  T: {
    shape: [
      [0, 1, 0],
      [1, 1, 1],
    ],
    color: '#a855f7',
  },
  S: {
    shape: [
      [0, 1, 1],
      [1, 1, 0],
    ],
    color: '#22c55e',
  },
  Z: {
    shape: [
      [1, 1, 0],
      [0, 1, 1],
    ],
    color: '#ef4444',
  },
  J: {
    shape: [
      [1, 0, 0],
      [1, 1, 1],
    ],
    color: '#3b82f6',
  },
  L: {
    shape: [
      [0, 0, 1],
      [1, 1, 1],
    ],
    color: '#f97316',
  },
};

const TETROMINO_KEYS = Object.keys(TETROMINOES);

type Cell = { filled: boolean; color: string };
type Board = Cell[][];
type Position = { x: number; y: number };

const createEmptyBoard = (): Board => {
  return Array.from({ length: BOARD_HEIGHT }, () =>
    Array.from({ length: BOARD_WIDTH }, () => ({ filled: false, color: '' }))
  );
};

const getRandomTetromino = () => {
  const key = TETROMINO_KEYS[Math.floor(Math.random() * TETROMINO_KEYS.length)];
  return { ...TETROMINOES[key], type: key };
};

const rotateMatrix = (matrix: number[][]): number[][] => {
  const rows = matrix.length;
  const cols = matrix[0].length;
  const rotated: number[][] = [];
  for (let col = 0; col < cols; col++) {
    const newRow: number[] = [];
    for (let row = rows - 1; row >= 0; row--) {
      newRow.push(matrix[row][col]);
    }
    rotated.push(newRow);
  }
  return rotated;
};

export default function TetrisLuxGame({ onBrightnessChange, onExit }: MinigameProps) {
  const [board, setBoard] = useState<Board>(createEmptyBoard());
  const [currentPiece, setCurrentPiece] = useState(() => getRandomTetromino());
  const [nextPiece, setNextPiece] = useState(() => getRandomTetromino());
  const [position, setPosition] = useState<Position>(() => {
    const piece = getRandomTetromino();
    return { x: 3, y: -piece.shape.length + 1 };
  });
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [score, setScore] = useState(0);
  const [linesCleared, setLinesCleared] = useState(0);
  const [level, setLevel] = useState(1);
  const [brightness, setBrightness] = useState(0.1);

  const gameOverRef = useRef(gameOver);
  const isPausedRef = useRef(isPaused);
  const positionRef = useRef(position);
  const currentPieceRef = useRef(currentPiece);
  const boardRef = useRef(board);
  const nextPieceRef = useRef(nextPiece);
  const levelRef = useRef(level);
  const brightnessRef = useRef(brightness);

  // Keep refs in sync
  useEffect(() => { gameOverRef.current = gameOver; }, [gameOver]);
  useEffect(() => { isPausedRef.current = isPaused; }, [isPaused]);
  useEffect(() => { positionRef.current = position; }, [position]);
  useEffect(() => { currentPieceRef.current = currentPiece; }, [currentPiece]);
  useEffect(() => { boardRef.current = board; }, [board]);
  useEffect(() => { nextPieceRef.current = nextPiece; }, [nextPiece]);
  useEffect(() => { levelRef.current = level; }, [level]);
  useEffect(() => { brightnessRef.current = brightness; }, [brightness]);

  // Check if piece can be placed at position
  const isValidPosition = useCallback((piece: number[][], pos: Position, gameBoard: Board): boolean => {
    for (let y = 0; y < piece.length; y++) {
      for (let x = 0; x < piece[y].length; x++) {
        if (piece[y][x]) {
          const newX = pos.x + x;
          const newY = pos.y + y;
          
          if (newX < 0 || newX >= BOARD_WIDTH || newY >= BOARD_HEIGHT) {
            return false;
          }
          if (newY >= 0 && gameBoard[newY][newX].filled) {
            return false;
          }
        }
      }
    }
    return true;
  }, []);

  // Lock piece to board and check for line clears
  const lockPiece = useCallback(() => {
    const currentBoard = boardRef.current;
    const newBoard = currentBoard.map(row => row.map(cell => ({ ...cell })));
    const piece = currentPieceRef.current;
    const pos = positionRef.current;

    // Add piece to board
    for (let y = 0; y < piece.shape.length; y++) {
      for (let x = 0; x < piece.shape[y].length; x++) {
        if (piece.shape[y][x]) {
          const boardY = pos.y + y;
          const boardX = pos.x + x;
          if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
            newBoard[boardY][boardX] = { filled: true, color: piece.color };
          }
        }
      }
    }

    // Check for complete lines
    let clearedCount = 0;
    const filteredBoard = newBoard.filter(row => {
      const isComplete = row.every(cell => cell.filled);
      if (isComplete) clearedCount++;
      return !isComplete;
    });

    // Add empty rows at top
    while (filteredBoard.length < BOARD_HEIGHT) {
      filteredBoard.unshift(
        Array.from({ length: BOARD_WIDTH }, () => ({ filled: false, color: '' }))
      );
    }

    // Update score and brightness only when lines are cleared
    if (clearedCount > 0) {
      const currentLevel = levelRef.current;
      const points = [0, 100, 300, 500, 800][clearedCount] * currentLevel;
      setScore(prev => prev + points);
      setLinesCleared(prev => {
        const newLines = prev + clearedCount;
        setLevel(Math.floor(newLines / 10) + 1);
        return newLines;
      });
      // Increase brightness when lines are cleared
      const currentBrightness = brightnessRef.current;
      const newBrightness = Math.min(1, currentBrightness + clearedCount * 0.1);
      setBrightness(newBrightness);
      onBrightnessChange(newBrightness);
    }

    setBoard(filteredBoard);

    // Spawn new piece - starts ABOVE the board (negative y) like real Tetris
    const newPiece = nextPieceRef.current;
    const pieceHeight = newPiece.shape.length;
    const startPos = { x: Math.floor((BOARD_WIDTH - newPiece.shape[0].length) / 2), y: -pieceHeight + 1 };

    // Game over only if new piece cannot spawn (overlaps with existing blocks at top)
    // Check if there are any blocks in the top 2 rows at spawn position
    let canSpawn = true;
    for (let py = 0; py < newPiece.shape.length; py++) {
      for (let px = 0; px < newPiece.shape[py].length; px++) {
        if (newPiece.shape[py][px]) {
          const boardY = startPos.y + py;
          const boardX = startPos.x + px;
          // Only check cells that are actually on the board (y >= 0)
          if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
            if (filteredBoard[boardY][boardX].filled) {
              canSpawn = false;
              break;
            }
          }
        }
      }
      if (!canSpawn) break;
    }

    if (!canSpawn) {
      setGameOver(true);
      onBrightnessChange(0.05);
      return;
    }

    setCurrentPiece(newPiece);
    setNextPiece(getRandomTetromino());
    setPosition(startPos);
  }, [onBrightnessChange]);

  // Move piece down
  const moveDown = useCallback(() => {
    if (gameOverRef.current || isPausedRef.current) return;

    const newPos = { ...positionRef.current, y: positionRef.current.y + 1 };
    
    if (isValidPosition(currentPieceRef.current.shape, newPos, boardRef.current)) {
      setPosition(newPos);
    } else {
      lockPiece();
    }
  }, [isValidPosition, lockPiece]);

  // Move piece left/right
  const moveHorizontal = useCallback((direction: number) => {
    if (gameOverRef.current || isPausedRef.current) return;

    const newPos = { ...positionRef.current, x: positionRef.current.x + direction };
    
    if (isValidPosition(currentPieceRef.current.shape, newPos, boardRef.current)) {
      setPosition(newPos);
    }
  }, [isValidPosition]);

  // Rotate piece
  const rotatePiece = useCallback(() => {
    if (gameOverRef.current || isPausedRef.current) return;

    const rotated = rotateMatrix(currentPieceRef.current.shape);
    
    // Try normal rotation
    if (isValidPosition(rotated, positionRef.current, boardRef.current)) {
      setCurrentPiece(prev => ({ ...prev, shape: rotated }));
      return;
    }

    // Wall kick attempts
    const kicks = [-1, 1, -2, 2];
    for (const kick of kicks) {
      const kickPos = { ...positionRef.current, x: positionRef.current.x + kick };
      if (isValidPosition(rotated, kickPos, boardRef.current)) {
        setCurrentPiece(prev => ({ ...prev, shape: rotated }));
        setPosition(kickPos);
        return;
      }
    }
  }, [isValidPosition]);

  // Hard drop
  const hardDrop = useCallback(() => {
    if (gameOverRef.current || isPausedRef.current) return;

    let newY = positionRef.current.y;
    while (isValidPosition(currentPieceRef.current.shape, { ...positionRef.current, y: newY + 1 }, boardRef.current)) {
      newY++;
    }
    setPosition(prev => ({ ...prev, y: newY }));
    setTimeout(lockPiece, 50);
  }, [isValidPosition, lockPiece]);

  // Game loop
  useEffect(() => {
    if (gameOver || isPaused) return;

    const speed = Math.max(100, 500 - (level - 1) * 50);
    const gameLoop = setInterval(moveDown, speed);

    return () => clearInterval(gameLoop);
  }, [gameOver, isPaused, level, moveDown]);

  // Initial brightness - start dim!
  useEffect(() => {
    setBrightness(0.1);
    onBrightnessChange(0.1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Swipe gesture handler
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderRelease: (_, gestureState) => {
        const { dx, dy } = gestureState;
        const absDx = Math.abs(dx);
        const absDy = Math.abs(dy);

        // Tap - rotate
        if (Math.max(absDx, absDy) < 10) {
          if (gameOverRef.current) {
            restartGame();
          } else if (isPausedRef.current) {
            setIsPaused(false);
          } else {
            rotatePiece();
          }
          return;
        }

        // Swipe down - hard drop
        if (absDy > absDx && dy > 30) {
          hardDrop();
          return;
        }

        // Swipe left/right - move
        if (absDx > absDy) {
          if (dx > 20) {
            moveHorizontal(1);
          } else if (dx < -20) {
            moveHorizontal(-1);
          }
        }
      },
    })
  ).current;

  const restartGame = () => {
    const newBoard = createEmptyBoard();
    const newPiece = getRandomTetromino();
    const pieceHeight = newPiece.shape.length;
    setBoard(newBoard);
    setCurrentPiece(newPiece);
    setNextPiece(getRandomTetromino());
    setPosition({ x: Math.floor((BOARD_WIDTH - newPiece.shape[0].length) / 2), y: -pieceHeight + 1 });
    setGameOver(false);
    setIsPaused(false);
    setScore(0);
    setLinesCleared(0);
    setLevel(1);
    setBrightness(0.1);
    onBrightnessChange(0.1);
  };

  // Render the board with current piece
  const renderBoard = () => {
    const displayBoard = board.map(row => row.map(cell => ({ ...cell })));
    
    // Add current piece to display
    if (!gameOver) {
      for (let y = 0; y < currentPiece.shape.length; y++) {
        for (let x = 0; x < currentPiece.shape[y].length; x++) {
          if (currentPiece.shape[y][x]) {
            const boardY = position.y + y;
            const boardX = position.x + x;
            if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
              displayBoard[boardY][boardX] = { filled: true, color: currentPiece.color };
            }
          }
        }
      }
    }

    return displayBoard;
  };

  // Render next piece preview
  const renderNextPiece = () => {
    return (
      <View style={styles.nextPieceContainer}>
        <Text style={styles.nextLabel}>NEXT</Text>
        <View style={styles.nextPieceGrid}>
          {nextPiece.shape.map((row, y) => (
            <View key={y} style={styles.nextPieceRow}>
              {row.map((cell, x) => (
                <View
                  key={x}
                  style={[
                    styles.nextPieceCell,
                    { backgroundColor: cell ? nextPiece.color : 'transparent' },
                  ]}
                />
              ))}
            </View>
          ))}
        </View>
      </View>
    );
  };

  const displayBoard = renderBoard();

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      <View style={styles.header}>
        <Text style={styles.title}>🧱 Tetris Lux</Text>
        <View style={styles.statsRow}>
          <Text style={styles.statText}>Score: {score}</Text>
          <Text style={styles.statText}>Level: {level}</Text>
        </View>
        <Text style={styles.brightness}>
          💡 {Math.round(brightness * 100)}% | Lines: {linesCleared}
        </Text>
        <Text style={styles.hint}>✨ Clear lines to brighten screen!</Text>
      </View>

      <View style={styles.gameArea}>
        <View style={[styles.board, { width: GAME_BOARD_WIDTH, height: GAME_BOARD_HEIGHT }]}>
          {displayBoard.map((row, y) => (
            <View key={y} style={styles.row}>
              {row.map((cell, x) => (
                <View
                  key={x}
                  style={[
                    styles.cell,
                    {
                      width: CELL_SIZE - 1,
                      height: CELL_SIZE - 1,
                      backgroundColor: cell.filled ? cell.color : '#1a1a2e',
                      borderColor: cell.filled ? 'rgba(255,255,255,0.3)' : '#2a2a3e',
                    },
                  ]}
                />
              ))}
            </View>
          ))}

          {/* Game Over Overlay */}
          {gameOver && (
            <View style={styles.overlay}>
              <Text style={styles.gameOverText}>💀 GAME OVER</Text>
              <Text style={styles.finalScore}>Score: {score}</Text>
              <Text style={styles.dimmedText}>Screen dimmed to 5%</Text>
              <Text style={styles.restartHint}>Tap to restart</Text>
            </View>
          )}

          {/* Pause Overlay */}
          {isPaused && !gameOver && (
            <View style={styles.overlay}>
              <Text style={styles.pausedText}>⏸️ PAUSED</Text>
              <Text style={styles.restartHint}>Tap to resume</Text>
            </View>
          )}
        </View>

        {renderNextPiece()}
      </View>

      <View style={styles.controls}>
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.controlButton} onPress={() => moveHorizontal(-1)}>
            <Text style={styles.buttonText}>◀</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlButton} onPress={rotatePiece}>
            <Text style={styles.buttonText}>↻</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlButton} onPress={() => moveHorizontal(1)}>
            <Text style={styles.buttonText}>▶</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.buttonRow}>
          <TouchableOpacity style={[styles.controlButton, styles.dropButton]} onPress={hardDrop}>
            <Text style={styles.buttonText}>▼ DROP</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.controlButton, styles.pauseButton]} onPress={() => setIsPaused(p => !p)}>
            <Text style={styles.buttonText}>{isPaused ? '▶' : '⏸'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0f',
    alignItems: 'center',
    paddingTop: 30,
  },
  header: {
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffd700',
    marginBottom: 5,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 2,
  },
  statText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  brightness: {
    fontSize: 14,
    color: '#888',
  },
  hint: {
    fontSize: 12,
    color: '#4ade80',
    fontStyle: 'italic',
    marginTop: 2,
  },
  gameArea: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  board: {
    backgroundColor: '#1a1a1a',
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#444',
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    borderWidth: 1,
    borderRadius: 2,
  },
  nextPieceContainer: {
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  nextLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 8,
    fontWeight: 'bold',
  },
  nextPieceGrid: {
    alignItems: 'center',
  },
  nextPieceRow: {
    flexDirection: 'row',
  },
  nextPieceCell: {
    width: 16,
    height: 16,
    borderRadius: 2,
    margin: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gameOverText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ef4444',
    marginBottom: 10,
  },
  pausedText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffd700',
    marginBottom: 10,
  },
  finalScore: {
    fontSize: 20,
    color: '#fff',
    marginBottom: 8,
  },
  dimmedText: {
    fontSize: 14,
    color: '#888',
    marginBottom: 20,
  },
  restartHint: {
    fontSize: 16,
    color: '#4ade80',
    fontStyle: 'italic',
  },
  controls: {
    marginTop: 15,
    alignItems: 'center',
    gap: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  controlButton: {
    width: 60,
    height: 50,
    backgroundColor: '#2a2a3e',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#444',
  },
  dropButton: {
    width: 120,
    backgroundColor: '#3b82f6',
  },
  pauseButton: {
    backgroundColor: '#444',
  },
  buttonText: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
  },
});
