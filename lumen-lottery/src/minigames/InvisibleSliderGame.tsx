// Invisible Slider Game
// Slider exists but has no visual - guess where it is!
// The slider can be in ANY direction, not just horizontal

import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Dimensions, 
  PanResponder,
  TouchableOpacity,
} from 'react-native';
import { MinigameProps } from '../types/Minigame';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Slider direction types
type SliderDirection = 'horizontal' | 'vertical' | 'diagonal-down' | 'diagonal-up' | 'circular';

const DIRECTIONS: SliderDirection[] = ['horizontal', 'vertical', 'diagonal-down', 'diagonal-up', 'circular'];

// Get a random direction
const getRandomDirection = (): SliderDirection => {
  return DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)];
};

export default function InvisibleSliderGame({ onBrightnessChange }: MinigameProps) {
  const [direction, setDirection] = useState<SliderDirection>(getRandomDirection);
  const [brightness, setBrightness] = useState(0.5);
  
  // For circular mode
  const centerX = SCREEN_WIDTH / 2;
  const centerY = SCREEN_HEIGHT / 2;

  // Start position for gesture tracking
  const startBrightness = useRef(0.5);

  // Calculate brightness based on position and direction
  const calculateBrightness = (x: number, y: number, dx: number, dy: number): number => {
    let newBrightness = startBrightness.current;
    
    switch (direction) {
      case 'horizontal':
        newBrightness = startBrightness.current + (dx / SCREEN_WIDTH);
        break;
      case 'vertical':
        newBrightness = startBrightness.current - (dy / SCREEN_HEIGHT);
        break;
      case 'diagonal-down':
        const diagDown = (dx + dy) / (SCREEN_WIDTH + SCREEN_HEIGHT) * 2;
        newBrightness = startBrightness.current + diagDown;
        break;
      case 'diagonal-up':
        const diagUp = (dx - dy) / (SCREEN_WIDTH + SCREEN_HEIGHT) * 2;
        newBrightness = startBrightness.current + diagUp;
        break;
      case 'circular':
        const newAngle = Math.atan2(y - centerY, x - centerX);
        newBrightness = (newAngle + Math.PI) / (2 * Math.PI);
        break;
    }
    
    return Math.max(0, Math.min(1, newBrightness));
  };

  // Check if movement is in the correct direction
  const isCorrectDirection = (dx: number, dy: number): boolean => {
    const threshold = 10;
    
    switch (direction) {
      case 'horizontal':
        return Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > threshold;
      case 'vertical':
        return Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > threshold;
      case 'diagonal-down':
        return dx * dy > 0 && Math.abs(dx) > threshold && Math.abs(dy) > threshold;
      case 'diagonal-up':
        return dx * dy < 0 && Math.abs(dx) > threshold && Math.abs(dy) > threshold;
      case 'circular':
        return Math.sqrt(dx * dx + dy * dy) > threshold;
      default:
        return false;
    }
  };

  // Pan responder for touch handling
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      
      onPanResponderGrant: () => {
        startBrightness.current = brightness;
      },
      
      onPanResponderMove: (evt, gestureState) => {
        const { dx, dy, moveX, moveY } = gestureState;
        
        if (isCorrectDirection(dx, dy)) {
          const newBrightness = calculateBrightness(moveX, moveY, dx, dy);
          setBrightness(newBrightness);
          onBrightnessChange(newBrightness);
        }
      },
    })
  ).current;

  // Reset game with new direction
  const resetGame = () => {
    setDirection(getRandomDirection());
    setBrightness(0.5);
    onBrightnessChange(0.5);
  };

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.emoji}>👻</Text>
        <Text style={styles.title}>Invisible Slider</Text>
        <Text style={styles.subtitle}>Find the hidden control!</Text>
      </View>

      {/* Invisible touch area */}
      <View style={styles.touchArea}>
        <Text style={styles.dragHint}>Drag anywhere...</Text>
        <Text style={styles.questionMark}>?</Text>
      </View>

      {/* Reset button */}
      <TouchableOpacity style={styles.resetButton} onPress={resetGame}>
        <Text style={styles.resetText}>🔀 New Direction</Text>
      </TouchableOpacity>

      {/* Instructions */}
      <Text style={styles.instructions}>
        The slider exists... somewhere.{'\n'}
        It could be horizontal, vertical, diagonal, or circular!{'\n'}
        No hints. No feedback. Good luck.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    alignItems: 'center',
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  emoji: {
    fontSize: 60,
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    marginTop: 5,
  },
  touchArea: {
    width: SCREEN_WIDTH - 40,
    height: 300,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#333',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 30,
  },
  dragHint: {
    fontSize: 16,
    color: '#444',
    textAlign: 'center',
  },
  questionMark: {
    fontSize: 120,
    color: '#222',
    marginTop: 10,
  },
  resetButton: {
    backgroundColor: '#333',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 20,
  },
  resetText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  instructions: {
    fontSize: 12,
    color: '#555',
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 30,
    paddingHorizontal: 30,
  },
});
