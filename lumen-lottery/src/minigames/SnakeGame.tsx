// Snake Brightness Game
// Developer: Lumen Lottery Team
// 
// Rules:
// - Snake length controls brightness (slower increase)
// - Poison decreases brightness!
// - Collision causes instant dim
// - Brightness updates every movement tick

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Dimensions, PanResponder } from 'react-native';
import { MinigameProps } from '../types/Minigame';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GRID_SIZE = 20;
const CELL_SIZE = Math.floor((SCREEN_WIDTH - 40) / GRID_SIZE);
const BOARD_SIZE = CELL_SIZE * GRID_SIZE;
const INITIAL_SPEED = 150;
const MIN_SPEED = 80;

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
type Position = { x: number; y: number };

const getRandomPosition = (snake: Position[], excludePositions: Position[] = []): Position => {
  let pos: Position;
  const allExcluded = [...snake, ...excludePositions];
  do {
    pos = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
  } while (allExcluded.some(segment => segment.x === pos.x && segment.y === pos.y));
  return pos;
};

export default function SnakeGame({ onBrightnessChange, onExit }: MinigameProps) {
  const [snake, setSnake] = useState<Position[]>([
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 },
  ]);
  const [food, setFood] = useState<Position>({ x: 15, y: 10 });
  const [poison, setPoison] = useState<Position[]>([]);
  const [direction, setDirection] = useState<Direction>('RIGHT');
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [brightness, setBrightness] = useState(0.15);
  const [poisonHits, setPoisonHits] = useState(0);
  
  const directionRef = useRef(direction);
  const snakeRef = useRef(snake);
  const brightnessRef = useRef(brightness);
  const gameOverRef = useRef(gameOver);
  const isPausedRef = useRef(isPaused);

  // Update refs when state changes
  useEffect(() => {
    directionRef.current = direction;
  }, [direction]);

  useEffect(() => {
    snakeRef.current = snake;
  }, [snake]);

  useEffect(() => {
    brightnessRef.current = brightness;
  }, [brightness]);

  useEffect(() => {
    gameOverRef.current = gameOver;
  }, [gameOver]);

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  // Calculate brightness based on snake length (SLOWER increase)
  const calculateBrightness = useCallback((length: number, currentBrightness: number, isPoisonHit: boolean) => {
    if (isPoisonHit) {
      // Poison decreases brightness by 15%
      return Math.max(0.05, currentBrightness - 0.15);
    }
    // Food increases brightness slowly - only +5% per apple
    const newBrightness = Math.min(1, currentBrightness + 0.05);
    return newBrightness;
  }, []);

  // Initial brightness and spawn initial poison
  useEffect(() => {
    const initialBrightness = 0.15;
    setBrightness(initialBrightness);
    onBrightnessChange(initialBrightness);
    
    // Spawn 2 initial poison items
    const initialSnake = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];
    const food1 = { x: 15, y: 10 };
    const poison1 = getRandomPosition(initialSnake, [food1]);
    const poison2 = getRandomPosition(initialSnake, [food1, poison1]);
    setPoison([poison1, poison2]);
  }, []);

  // Game loop
  useEffect(() => {
    if (gameOver || isPaused) return;

    const speed = Math.max(MIN_SPEED, INITIAL_SPEED - score * 2);
    
    const gameLoop = setInterval(() => {
      setSnake(prevSnake => {
        const currentDirection = directionRef.current;
        const head = { ...prevSnake[0] };

        // Move head based on direction
        switch (currentDirection) {
          case 'UP': head.y -= 1; break;
          case 'DOWN': head.y += 1; break;
          case 'LEFT': head.x -= 1; break;
          case 'RIGHT': head.x += 1; break;
        }

        // Check wall collision
        if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
          setGameOver(true);
          onBrightnessChange(0.05); // Instant dim on death!
          return prevSnake;
        }

        // Check self collision
        if (prevSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
          setGameOver(true);
          onBrightnessChange(0.05); // Instant dim on death!
          return prevSnake;
        }

        const newSnake = [head, ...prevSnake];

        // Check food collision
        if (head.x === food.x && head.y === food.y) {
          const newFood = getRandomPosition(newSnake, poison);
          setFood(newFood);
          setScore(prev => prev + 1);
          
          // Increase brightness slowly
          const newBrightness = calculateBrightness(newSnake.length, brightnessRef.current, false);
          setBrightness(newBrightness);
          onBrightnessChange(newBrightness);
          
          // Spawn new poison every 3 apples
          if ((score + 1) % 3 === 0) {
            setPoison(prev => {
              const newPoison = getRandomPosition(newSnake, [...prev, newFood]);
              return [...prev, newPoison];
            });
          }
          
          return newSnake; // Don't remove tail = grow
        }

        // Check poison collision
        const poisonIndex = poison.findIndex(p => p.x === head.x && p.y === head.y);
        if (poisonIndex !== -1) {
          // Hit poison! Decrease brightness
          const newBrightness = calculateBrightness(newSnake.length, brightnessRef.current, true);
          setBrightness(newBrightness);
          onBrightnessChange(newBrightness);
          setPoisonHits(prev => prev + 1);
          
          // Remove eaten poison and spawn a new one elsewhere
          setPoison(prev => {
            const remaining = prev.filter((_, i) => i !== poisonIndex);
            const newPoison = getRandomPosition(newSnake, [...remaining, food]);
            return [...remaining, newPoison];
          });
          
          // Snake shrinks by 1 (if longer than 2)
          if (newSnake.length > 3) {
            newSnake.pop();
            newSnake.pop(); // Remove 2 segments (1 for movement + 1 penalty)
            return newSnake;
          }
        }

        newSnake.pop(); // Remove tail
        return newSnake;
      });
    }, speed);

    return () => clearInterval(gameLoop);
  }, [gameOver, isPaused, food, poison, score, calculateBrightness, onBrightnessChange]);

  // Swipe gesture handler
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderRelease: (_, gestureState) => {
        const { dx, dy } = gestureState;
        const absDx = Math.abs(dx);
        const absDy = Math.abs(dy);

        // Minimum swipe distance
        if (Math.max(absDx, absDy) < 10) {
          // Tap - toggle pause or restart
          if (gameOverRef.current) {
            restartGame();
          } else {
            setIsPaused(prev => !prev);
          }
          return;
        }

        // Determine swipe direction
        if (absDx > absDy) {
          // Horizontal swipe
          if (dx > 0 && directionRef.current !== 'LEFT') {
            setDirection('RIGHT');
          } else if (dx < 0 && directionRef.current !== 'RIGHT') {
            setDirection('LEFT');
          }
        } else {
          // Vertical swipe
          if (dy > 0 && directionRef.current !== 'UP') {
            setDirection('DOWN');
          } else if (dy < 0 && directionRef.current !== 'DOWN') {
            setDirection('UP');
          }
        }
      },
    })
  ).current;

  const restartGame = () => {
    const initialSnake = [
      { x: 10, y: 10 },
      { x: 9, y: 10 },
      { x: 8, y: 10 },
    ];
    const newFood = getRandomPosition(initialSnake);
    const poison1 = getRandomPosition(initialSnake, [newFood]);
    const poison2 = getRandomPosition(initialSnake, [newFood, poison1]);
    
    setSnake(initialSnake);
    setFood(newFood);
    setPoison([poison1, poison2]);
    setDirection('RIGHT');
    setGameOver(false);
    setScore(0);
    setPoisonHits(0);
    setIsPaused(false);
    
    const initialBrightness = 0.15;
    setBrightness(initialBrightness);
    onBrightnessChange(initialBrightness);
  };

  // Update high score
  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
    }
  }, [score, highScore]);

  const getBrightnessPercent = () => {
    return Math.round(brightness * 100);
  };

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      <View style={styles.header}>
        <Text style={styles.title}>🐍 Snake</Text>
        <View style={styles.statsRow}>
          <Text style={styles.score}>Score: {score}</Text>
          <Text style={styles.highScore}>Best: {highScore}</Text>
        </View>
        <Text style={styles.brightness}>
          💡 {getBrightnessPercent()}% {poisonHits > 0 && <Text style={styles.poisonCount}>☠️ {poisonHits}</Text>}
        </Text>
      </View>

      <View style={[styles.board, { width: BOARD_SIZE, height: BOARD_SIZE }]}>
        {/* Grid background */}
        {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, index) => {
          const x = index % GRID_SIZE;
          const y = Math.floor(index / GRID_SIZE);
          const isEven = (x + y) % 2 === 0;
          return (
            <View
              key={index}
              style={[
                styles.cell,
                {
                  left: x * CELL_SIZE,
                  top: y * CELL_SIZE,
                  width: CELL_SIZE,
                  height: CELL_SIZE,
                  backgroundColor: isEven ? '#1a2a1a' : '#152015',
                },
              ]}
            />
          );
        })}

        {/* Snake */}
        {snake.map((segment, index) => (
          <View
            key={index}
            style={[
              styles.snakeSegment,
              {
                left: segment.x * CELL_SIZE,
                top: segment.y * CELL_SIZE,
                width: CELL_SIZE - 2,
                height: CELL_SIZE - 2,
                backgroundColor: index === 0 ? '#4ade80' : '#22c55e',
                borderRadius: index === 0 ? CELL_SIZE / 2 : 4,
              },
            ]}
          >
            {index === 0 && (
              <Text style={styles.snakeEyes}>
                {direction === 'LEFT' ? '◀' : direction === 'RIGHT' ? '▶' : direction === 'UP' ? '▲' : '▼'}
              </Text>
            )}
          </View>
        ))}

        {/* Food */}
        <View
          style={[
            styles.food,
            {
              left: food.x * CELL_SIZE,
              top: food.y * CELL_SIZE,
              width: CELL_SIZE - 2,
              height: CELL_SIZE - 2,
            },
          ]}
        >
          <Text style={styles.foodEmoji}>🍎</Text>
        </View>

        {/* Poison */}
        {poison.map((p, index) => (
          <View
            key={`poison-${index}`}
            style={[
              styles.poison,
              {
                left: p.x * CELL_SIZE,
                top: p.y * CELL_SIZE,
                width: CELL_SIZE - 2,
                height: CELL_SIZE - 2,
              },
            ]}
          >
            <Text style={styles.poisonEmoji}>☠️</Text>
          </View>
        ))}

        {/* Game Over Overlay */}
        {gameOver && (
          <View style={styles.overlay}>
            <Text style={styles.gameOverText}>💀 GAME OVER</Text>
            <Text style={styles.finalScore}>Final Score: {score}</Text>
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

      <View style={styles.controls}>
        <Text style={styles.controlHint}>🍎 +5% brightness  ☠️ -15% brightness</Text>
        <Text style={styles.controlHint}>👆 Swipe to move • Tap to pause</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0f',
    alignItems: 'center',
    paddingTop: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4ade80',
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 4,
  },
  score: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '600',
  },
  highScore: {
    fontSize: 18,
    color: '#ffd700',
    fontWeight: '600',
  },
  brightness: {
    fontSize: 14,
    color: '#888',
  },
  board: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#333',
    position: 'relative',
    overflow: 'hidden',
  },
  cell: {
    position: 'absolute',
  },
  snakeSegment: {
    position: 'absolute',
    margin: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  snakeEyes: {
    fontSize: 8,
    color: '#fff',
  },
  food: {
    position: 'absolute',
    margin: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  foodEmoji: {
    fontSize: CELL_SIZE - 6,
  },
  poison: {
    position: 'absolute',
    margin: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  poisonEmoji: {
    fontSize: CELL_SIZE - 6,
  },
  poisonCount: {
    color: '#a855f7',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
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
    marginTop: 20,
    alignItems: 'center',
  },
  controlHint: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
});
