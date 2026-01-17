// Flappy Bright Game
// Developer: Lumen Lottery Team
// 
// Rules:
// - Tap to flap and avoid pipes
// - Each pipe passed = +1 score
// - When you crash, your score becomes your brightness %
// - Score 100+ = 100% brightness (capped)

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableWithoutFeedback } from 'react-native';
import { MinigameProps } from '../types/Minigame';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Game constants
const BIRD_SIZE = 40;
const GRAVITY = 0.4;           // Reduced from 0.6 - slower fall
const JUMP_FORCE = -8;         // Reduced from -10 - gentler jump
const PIPE_WIDTH = 60;
const PIPE_GAP = 220;          // Increased from 180 - bigger gap to fly through
const PIPE_SPEED = 2.5;        // Reduced from 3 - slower pipes
const GAME_AREA_TOP = 80;
const GAME_AREA_BOTTOM = 100;
const PIPE_SPACING = 300;      // Distance between pipes (was 250)

interface Pipe {
  x: number;
  gapY: number;
  passed: boolean;
}

export default function FlappyBrightGame({ onBrightnessChange, onExit }: MinigameProps) {
  const [gameState, setGameState] = useState<'ready' | 'playing' | 'gameover'>('ready');
  const [birdY, setBirdY] = useState(SCREEN_HEIGHT / 2);
  const [birdVelocity, setBirdVelocity] = useState(0);
  const [pipes, setPipes] = useState<Pipe[]>([]);
  const [score, setScore] = useState(0);
  
  const gameLoopRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const birdYRef = useRef(SCREEN_HEIGHT / 2);
  const birdVelocityRef = useRef(0);
  const pipesRef = useRef<Pipe[]>([]);
  const scoreRef = useRef(0);

  // Generate random gap position for pipes
  const generatePipeGapY = () => {
    const minY = GAME_AREA_TOP + PIPE_GAP / 2 + 50;
    const maxY = SCREEN_HEIGHT - GAME_AREA_BOTTOM - PIPE_GAP / 2 - 50;
    return Math.random() * (maxY - minY) + minY;
  };

  // Check collision between bird and pipes
  const checkCollision = useCallback((birdY: number, pipes: Pipe[]): boolean => {
    const birdLeft = SCREEN_WIDTH * 0.2;
    const birdRight = birdLeft + BIRD_SIZE;
    const birdTop = birdY;
    const birdBottom = birdY + BIRD_SIZE;

    // Check floor and ceiling
    if (birdTop <= GAME_AREA_TOP || birdBottom >= SCREEN_HEIGHT - GAME_AREA_BOTTOM) {
      return true;
    }

    // Check pipe collisions
    for (const pipe of pipes) {
      const pipeLeft = pipe.x;
      const pipeRight = pipe.x + PIPE_WIDTH;
      
      // Check if bird is in horizontal range of pipe
      if (birdRight > pipeLeft && birdLeft < pipeRight) {
        const gapTop = pipe.gapY - PIPE_GAP / 2;
        const gapBottom = pipe.gapY + PIPE_GAP / 2;
        
        // Check if bird is outside the gap
        if (birdTop < gapTop || birdBottom > gapBottom) {
          return true;
        }
      }
    }

    return false;
  }, []);

  // Handle game over
  const handleGameOver = useCallback((finalScore: number) => {
    if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
      gameLoopRef.current = null;
    }
    
    setGameState('gameover');
    
    // Set brightness based on score
    // Score 0 = 5% (minimum), Score 100+ = 100% (maximum)
    // Maps score linearly: 0->0.05, 100->1.0
    const minBrightness = 0.05;
    const maxBrightness = 1.0;
    const scorePercent = Math.min(finalScore, 100) / 100;
    const brightness = minBrightness + (maxBrightness - minBrightness) * scorePercent;
    onBrightnessChange(brightness);
  }, [onBrightnessChange]);

  // Game loop
  useEffect(() => {
    if (gameState !== 'playing') return;

    gameLoopRef.current = setInterval(() => {
      // Update bird physics
      birdVelocityRef.current += GRAVITY;
      birdYRef.current += birdVelocityRef.current;
      
      // Update pipes
      const updatedPipes = pipesRef.current
        .map(pipe => ({ ...pipe, x: pipe.x - PIPE_SPEED }))
        .filter(pipe => pipe.x > -PIPE_WIDTH);
      
      // Check for passed pipes and update score
      let newScore = scoreRef.current;
      updatedPipes.forEach(pipe => {
        const birdX = SCREEN_WIDTH * 0.2 + BIRD_SIZE / 2;
        if (!pipe.passed && pipe.x + PIPE_WIDTH < birdX) {
          pipe.passed = true;
          newScore++;
        }
      });
      
      // Add new pipe if needed
      const lastPipe = updatedPipes[updatedPipes.length - 1];
      if (!lastPipe || lastPipe.x < SCREEN_WIDTH - PIPE_SPACING) {
        updatedPipes.push({
          x: SCREEN_WIDTH,
          gapY: generatePipeGapY(),
          passed: false,
        });
      }
      
      pipesRef.current = updatedPipes;
      scoreRef.current = newScore;
      
      // Check collision
      if (checkCollision(birdYRef.current, updatedPipes)) {
        handleGameOver(newScore);
        return;
      }
      
      // Update state for rendering
      setBirdY(birdYRef.current);
      setBirdVelocity(birdVelocityRef.current);
      setPipes([...updatedPipes]);
      setScore(newScore);
    }, 1000 / 60); // 60 FPS

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [gameState, checkCollision, handleGameOver]);

  // Handle tap
  const handleTap = () => {
    if (gameState === 'ready') {
      // Start game
      setGameState('playing');
      birdYRef.current = SCREEN_HEIGHT / 2;
      birdVelocityRef.current = JUMP_FORCE;
      pipesRef.current = [{
        x: SCREEN_WIDTH,
        gapY: generatePipeGapY(),
        passed: false,
      }];
      scoreRef.current = 0;
      setBirdY(SCREEN_HEIGHT / 2);
      setBirdVelocity(JUMP_FORCE);
      setPipes([...pipesRef.current]);
      setScore(0);
    } else if (gameState === 'playing') {
      // Flap
      birdVelocityRef.current = JUMP_FORCE;
      setBirdVelocity(JUMP_FORCE);
    } else if (gameState === 'gameover') {
      // Restart
      setGameState('ready');
      birdYRef.current = SCREEN_HEIGHT / 2;
      birdVelocityRef.current = 0;
      pipesRef.current = [];
      scoreRef.current = 0;
      setBirdY(SCREEN_HEIGHT / 2);
      setBirdVelocity(0);
      setPipes([]);
      setScore(0);
    }
  };

  // Calculate bird rotation based on velocity
  const birdRotation = Math.max(-30, Math.min(90, birdVelocity * 3));

  return (
    <TouchableWithoutFeedback onPress={handleTap}>
      <View style={styles.container}>
        {/* Score display */}
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreText}>{score}</Text>
        </View>

        {/* Game area */}
        <View style={styles.gameArea}>
          {/* Ceiling */}
          <View style={[styles.boundary, styles.ceiling]} />
          
          {/* Floor */}
          <View style={[styles.boundary, styles.floor]} />

          {/* Pipes */}
          {pipes.map((pipe, index) => (
            <React.Fragment key={index}>
              {/* Top pipe */}
              <View
                style={[
                  styles.pipe,
                  {
                    left: pipe.x,
                    top: GAME_AREA_TOP,
                    height: pipe.gapY - PIPE_GAP / 2 - GAME_AREA_TOP,
                  },
                ]}
              />
              {/* Bottom pipe */}
              <View
                style={[
                  styles.pipe,
                  {
                    left: pipe.x,
                    top: pipe.gapY + PIPE_GAP / 2,
                    height: SCREEN_HEIGHT - GAME_AREA_BOTTOM - (pipe.gapY + PIPE_GAP / 2),
                  },
                ]}
              />
            </React.Fragment>
          ))}

          {/* Bird */}
          <View
            style={[
              styles.bird,
              {
                top: birdY,
                left: SCREEN_WIDTH * 0.2,
                transform: [{ rotate: `${birdRotation}deg` }],
              },
            ]}
          >
            <Text style={styles.birdEmoji}>🐦</Text>
          </View>
        </View>

        {/* Ready state overlay */}
        {gameState === 'ready' && (
          <View style={styles.overlay}>
            <Text style={styles.titleEmoji}>🐦</Text>
            <Text style={styles.title}>Flappy Bright</Text>
            <Text style={styles.instructions}>Tap to flap!</Text>
            <Text style={styles.hint}>Your score when you crash{'\n'}= Your brightness %</Text>
          </View>
        )}

        {/* Game over overlay */}
        {gameState === 'gameover' && (
          <View style={styles.overlay}>
            <Text style={styles.gameOverEmoji}>💥</Text>
            <Text style={styles.gameOverText}>Game Over!</Text>
            <Text style={styles.finalScore}>Score: {score}</Text>
            <Text style={styles.brightnessResult}>
              Brightness set to {Math.round(5 + (Math.min(score, 100) / 100) * 95)}%
            </Text>
            <Text style={styles.tapToRestart}>Tap to play again</Text>
          </View>
        )}

        {/* Exit button */}
        <TouchableWithoutFeedback onPress={onExit}>
          <View style={styles.exitButton}>
            <Text style={styles.exitText}>✕</Text>
          </View>
        </TouchableWithoutFeedback>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#87CEEB', // Sky blue
  },
  gameArea: {
    flex: 1,
    position: 'relative',
  },
  boundary: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: '#228B22', // Forest green
  },
  ceiling: {
    top: 0,
    height: GAME_AREA_TOP,
  },
  floor: {
    bottom: 0,
    height: GAME_AREA_BOTTOM,
  },
  pipe: {
    position: 'absolute',
    width: PIPE_WIDTH,
    backgroundColor: '#32CD32', // Lime green
    borderWidth: 3,
    borderColor: '#228B22',
    borderRadius: 4,
  },
  bird: {
    position: 'absolute',
    width: BIRD_SIZE,
    height: BIRD_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  birdEmoji: {
    fontSize: 32,
  },
  scoreContainer: {
    position: 'absolute',
    top: GAME_AREA_TOP + 10,
    left: 0,
    right: 0,
    zIndex: 100,
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: '#000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  titleEmoji: {
    fontSize: 80,
    marginBottom: 10,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 20,
  },
  instructions: {
    fontSize: 24,
    color: '#fff',
    marginBottom: 20,
  },
  hint: {
    fontSize: 16,
    color: '#aaa',
    textAlign: 'center',
    lineHeight: 24,
  },
  gameOverEmoji: {
    fontSize: 60,
    marginBottom: 10,
  },
  gameOverText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FF6347',
    marginBottom: 20,
  },
  finalScore: {
    fontSize: 28,
    color: '#FFD700',
    marginBottom: 10,
  },
  brightnessResult: {
    fontSize: 20,
    color: '#90EE90',
    marginBottom: 30,
  },
  tapToRestart: {
    fontSize: 18,
    color: '#fff',
  },
  exitButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 200,
  },
  exitText: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
  },
});
