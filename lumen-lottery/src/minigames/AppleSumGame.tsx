// Apple Sum Puzzle Game
// Lasso apples that sum EXACTLY to 10!
// Developer: Jun En

import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  PanResponder, 
  Dimensions,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { MinigameProps } from '../types/Minigame';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Game area dimensions
const GAME_AREA_TOP = 180;
const GAME_AREA_HEIGHT = SCREEN_HEIGHT - 350;
const APPLE_SIZE = 60;
const LASSO_LAG = 20; // Lasso trails behind finger

interface Apple {
  id: number;
  x: number;
  y: number;
  number: number;
  selected: boolean;
  wiggleAnim: Animated.Value;
}

const generateApples = (): Apple[] => {
  const apples: Apple[] = [];
  const padding = APPLE_SIZE;
  
  for (let i = 0; i < 10; i++) {
    // Random position with some spacing attempts
    let x: number = 0;
    let y: number = 0;
    let attempts = 0;
    do {
      x = padding + Math.random() * (SCREEN_WIDTH - padding * 2 - APPLE_SIZE);
      y = padding + Math.random() * (GAME_AREA_HEIGHT - padding * 2 - APPLE_SIZE);
      attempts++;
    } while (attempts < 10 && apples.some(a => 
      Math.abs(a.x - x) < APPLE_SIZE && Math.abs(a.y - y) < APPLE_SIZE
    ));
    
    apples.push({
      id: i,
      x,
      y,
      number: Math.floor(Math.random() * 5) + 1, // 1-5
      selected: false,
      wiggleAnim: new Animated.Value(0),
    });
  }
  return apples;
};

export default function AppleSumGame({ onBrightnessChange, onExit }: MinigameProps) {
  const [apples, setApples] = useState<Apple[]>([]);
  const [lassoCenter, setLassoCenter] = useState<{ x: number; y: number } | null>(null);
  const [lassoRadius, setLassoRadius] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [gameTime, setGameTime] = useState(60);
  const [bestScore, setBestScore] = useState(0);
  const [roundResult, setRoundResult] = useState<{ success: boolean; sum: number; count: number } | null>(null);
  const [showCalculating, setShowCalculating] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  
  // Refs for pan responder (to avoid stale closures)
  const applesRef = useRef<Apple[]>([]);
  const lassoStartRef = useRef<{ x: number; y: number } | null>(null);
  const isDraggingRef = useRef(false);
  const gameOverRef = useRef(false);
  const roundResultRef = useRef<{ success: boolean; sum: number; count: number } | null>(null);
  const bestScoreRef = useRef(0);
  
  // Keep refs in sync
  applesRef.current = apples;
  gameOverRef.current = gameOver;
  roundResultRef.current = roundResult;
  bestScoreRef.current = bestScore;

  // Initialize game
  useEffect(() => {
    startNewRound();
    onBrightnessChange(0.1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Game timer
  useEffect(() => {
    if (gameOver) return;
    
    const timer = setInterval(() => {
      setGameTime(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setGameOver(true);
          // Final brightness based on best score
          onBrightnessChange(Math.max(0.1, bestScore / 10));
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [gameOver, bestScore, onBrightnessChange]);

  // Apple wiggle animation
  useEffect(() => {
    apples.forEach(apple => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(apple.wiggleAnim, {
            toValue: 1,
            duration: 300 + Math.random() * 200,
            useNativeDriver: true,
          }),
          Animated.timing(apple.wiggleAnim, {
            toValue: -1,
            duration: 300 + Math.random() * 200,
            useNativeDriver: true,
          }),
          Animated.timing(apple.wiggleAnim, {
            toValue: 0,
            duration: 300 + Math.random() * 200,
            useNativeDriver: true,
          }),
        ])
      ).start();
    });
  }, [apples]);

  // Round countdown
  useEffect(() => {
    if (countdown <= 0) return;
    
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          startNewRound();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [countdown]);

  const startNewRound = () => {
    setApples(generateApples());
    setRoundResult(null);
    setShowCalculating(false);
  };

  // Pan responder for lasso
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      
      onPanResponderGrant: (evt) => {
        if (gameOverRef.current || roundResultRef.current) return;
        
        const { locationX, locationY } = evt.nativeEvent;
        const adjustedY = locationY - GAME_AREA_TOP;
        
        lassoStartRef.current = { x: locationX, y: adjustedY };
        setLassoCenter({ x: locationX, y: adjustedY });
        setLassoRadius(0);
        isDraggingRef.current = true;
        setIsDragging(true);
      },
      
      onPanResponderMove: (evt) => {
        if (gameOverRef.current || roundResultRef.current || !isDraggingRef.current) return;
        
        const { locationX, locationY } = evt.nativeEvent;
        const adjustedY = locationY - GAME_AREA_TOP;
        
        const start = lassoStartRef.current;
        if (start) {
          // Lasso trails behind finger by LASSO_LAG pixels
          const dx = locationX - start.x;
          const dy = adjustedY - start.y;
          const targetRadius = Math.sqrt(dx * dx + dy * dy);
          
          // Center between start and current (with lag)
          const centerX = start.x + dx * 0.5;
          const centerY = start.y + dy * 0.5;
          
          setLassoCenter({ x: centerX, y: centerY });
          setLassoRadius(Math.max(0, targetRadius / 2 - LASSO_LAG));
          
          // Update selected state
          const selected = applesRef.current.filter(apple => {
            const appleCenterX = apple.x + APPLE_SIZE / 2;
            const appleCenterY = apple.y + APPLE_SIZE / 2;
            const distance = Math.sqrt(
              Math.pow(appleCenterX - centerX, 2) + Math.pow(appleCenterY - centerY, 2)
            );
            return distance <= targetRadius / 2 + APPLE_SIZE / 2;
          });
          
          setApples(prev => prev.map(apple => ({
            ...apple,
            selected: selected.some(s => s.id === apple.id),
          })));
        }
      },
      
      onPanResponderRelease: () => {
        if (gameOverRef.current || roundResultRef.current) return;
        
        isDraggingRef.current = false;
        setIsDragging(false);
        
        // Get selected apples
        const selected = applesRef.current.filter(a => a.selected);
        
        if (selected.length > 0) {
          // Show fake calculating overlay
          setShowCalculating(true);
          
          setTimeout(() => {
            setShowCalculating(false);
            
            const sum = selected.reduce((acc, a) => acc + a.number, 0);
            const count = selected.length;
            const success = sum === 10;
            
            setRoundResult({ success, sum, count });
            
            if (success) {
              // Update best score and brightness
              if (count > bestScoreRef.current) {
                setBestScore(count);
              }
              onBrightnessChange(count / 10);
            } else {
              onBrightnessChange(0.1);
            }
            
            // Start countdown to next round
            setCountdown(3);
          }, 1000);
        }
        
        setLassoCenter(null);
        setLassoRadius(0);
        lassoStartRef.current = null;
      },
    })
  ).current;

  // Calculate current sum of selected apples
  const currentSum = apples.filter(a => a.selected).reduce((acc, a) => acc + a.number, 0);
  const selectedCount = apples.filter(a => a.selected).length;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>🍎 Apple Sum Puzzle</Text>
        <Text style={styles.instruction}>Lasso apples that sum to 10!</Text>
        <View style={styles.statsRow}>
          <Text style={styles.timer}>⏱️ {gameTime}s</Text>
          <Text style={styles.bestScore}>🏆 Best: {bestScore}/10</Text>
        </View>
        {isDragging && (
          <Text style={styles.currentSum}>
            Sum: {currentSum}/10 ({selectedCount} apples)
          </Text>
        )}
      </View>

      {/* Game Area */}
      <View style={styles.gameArea} {...panResponder.panHandlers}>
        {/* Apples */}
        {apples.map(apple => (
          <Animated.View
            key={apple.id}
            style={[
              styles.apple,
              {
                left: apple.x,
                top: apple.y,
                backgroundColor: apple.selected ? '#ff6b6b' : '#e74c3c',
                borderColor: apple.selected ? '#ffd700' : '#c0392b',
                borderWidth: apple.selected ? 4 : 2,
                transform: [
                  {
                    translateX: apple.wiggleAnim.interpolate({
                      inputRange: [-1, 0, 1],
                      outputRange: [-3, 0, 3],
                    }),
                  },
                  {
                    rotate: apple.wiggleAnim.interpolate({
                      inputRange: [-1, 0, 1],
                      outputRange: ['-3deg', '0deg', '3deg'],
                    }),
                  },
                ],
              },
            ]}
          >
            <Text style={styles.appleNumber}>{apple.number}</Text>
            <Text style={styles.appleStem}>🍃</Text>
          </Animated.View>
        ))}

        {/* Lasso */}
        {lassoCenter && lassoRadius > 0 && (
          <View
            style={[
              styles.lasso,
              {
                left: lassoCenter.x - lassoRadius,
                top: lassoCenter.y - lassoRadius,
                width: lassoRadius * 2,
                height: lassoRadius * 2,
                borderRadius: lassoRadius,
              },
            ]}
          />
        )}

        {/* Calculating Overlay */}
        {showCalculating && (
          <View style={styles.calculatingOverlay}>
            <Text style={styles.calculatingText}>🧮 Calculating...</Text>
          </View>
        )}
      </View>

      {/* Result */}
      {roundResult && (
        <View style={[
          styles.resultContainer,
          { backgroundColor: roundResult.success ? '#1a3a1a' : '#3a1a1a' }
        ]}>
          {roundResult.success ? (
            <>
              <Text style={styles.successText}>✅ PERFECT!</Text>
              <Text style={styles.resultScore}>
                Score: {roundResult.count}/10 apples!
              </Text>
              <Text style={styles.brightnessText}>
                Brightness: {Math.round(roundResult.count * 10)}%
              </Text>
            </>
          ) : (
            <>
              <Text style={styles.failText}>❌ Sum was {roundResult.sum}</Text>
              <Text style={styles.resultHint}>Needed exactly 10!</Text>
              <Text style={styles.brightnessText}>Brightness: 10%</Text>
            </>
          )}
          
          {/* Countdown progress bar (goes DOWN) */}
          <View style={styles.countdownContainer}>
            <Text style={styles.countdownLabel}>Next round in {countdown}...</Text>
            <View style={styles.countdownBar}>
              <View style={[styles.countdownProgress, { width: `${(countdown / 3) * 100}%` }]} />
            </View>
          </View>
        </View>
      )}

      {/* Game Over */}
      {gameOver && (
        <View style={styles.gameOverContainer}>
          <Text style={styles.gameOverText}>⏰ TIME&apos;S UP!</Text>
          <Text style={styles.finalScore}>Best Round: {bestScore}/10 apples</Text>
          <Text style={styles.finalBrightness}>
            Final Brightness: {Math.round(Math.max(10, bestScore * 10))}%
          </Text>
          <TouchableOpacity style={styles.exitButton} onPress={onExit}>
            <Text style={styles.exitButtonText}>🚪 Exit</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#228B22', // Orchard green
  },
  header: {
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 10,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffd700',
    marginBottom: 4,
  },
  instruction: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 30,
  },
  timer: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  bestScore: {
    fontSize: 18,
    color: '#ffd700',
    fontWeight: 'bold',
  },
  currentSum: {
    fontSize: 24,
    color: '#ffd700',
    fontWeight: 'bold',
    marginTop: 10,
  },
  gameArea: {
    flex: 1,
    position: 'relative',
  },
  apple: {
    position: 'absolute',
    width: APPLE_SIZE,
    height: APPLE_SIZE,
    borderRadius: APPLE_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  appleNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  appleStem: {
    position: 'absolute',
    top: -10,
    fontSize: 16,
  },
  lasso: {
    position: 'absolute',
    borderWidth: 4,
    borderColor: '#ffd700',
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    borderStyle: 'dashed',
  },
  calculatingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  calculatingText: {
    fontSize: 32,
    color: '#ffd700',
    fontWeight: 'bold',
  },
  resultContainer: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
  },
  successText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4ade80',
    marginBottom: 5,
  },
  failText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ef4444',
    marginBottom: 5,
  },
  resultScore: {
    fontSize: 20,
    color: '#fff',
    marginBottom: 5,
  },
  resultHint: {
    fontSize: 16,
    color: '#888',
    marginBottom: 5,
  },
  brightnessText: {
    fontSize: 16,
    color: '#ffd700',
    marginBottom: 15,
  },
  countdownContainer: {
    alignItems: 'center',
    width: '100%',
  },
  countdownLabel: {
    fontSize: 14,
    color: '#888',
    marginBottom: 5,
  },
  countdownBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#333',
    borderRadius: 4,
    overflow: 'hidden',
  },
  countdownProgress: {
    height: '100%',
    backgroundColor: '#ffd700',
    borderRadius: 4,
  },
  gameOverContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gameOverText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ffd700',
    marginBottom: 20,
  },
  finalScore: {
    fontSize: 24,
    color: '#fff',
    marginBottom: 10,
  },
  finalBrightness: {
    fontSize: 20,
    color: '#4ade80',
    marginBottom: 30,
  },
  exitButton: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 30,
  },
  exitButtonText: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
  },
});
