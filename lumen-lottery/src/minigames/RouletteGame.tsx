// Roulette Wheel Game
// Spin for brightness, number 0-36 maps to 0%-100% brightness

import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing } from 'react-native';
import { MinigameProps } from '../types/Minigame';

// Standard European roulette wheel order
const ROULETTE_NUMBERS = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10,
  5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26
];

const RED_NUMBERS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];

function getColor(num: number): string {
  if (num === 0) return '#0a5f38'; // Green for 0
  return RED_NUMBERS.includes(num) ? '#c41e3a' : '#1a1a1a'; // Red or Black
}

export default function RouletteGame({ onBrightnessChange, onExit }: MinigameProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<number | null>(null);
  const [brightnessPercent, setBrightnessPercent] = useState<number | null>(null);
  
  const wheelRotation = useRef(new Animated.Value(0)).current;
  const ballRotation = useRef(new Animated.Value(0)).current;
  const ballRadius = useRef(new Animated.Value(120)).current;

  const spin = () => {
    if (isSpinning) return;
    
    setIsSpinning(true);
    setResult(null);
    setBrightnessPercent(null);
    
    // Pick a random winning number
    const winningIndex = Math.floor(Math.random() * ROULETTE_NUMBERS.length);
    const winningNumber = ROULETTE_NUMBERS[winningIndex];
    
    // Calculate the angle for the winning number
    const sliceAngle = 360 / ROULETTE_NUMBERS.length;
    const targetAngle = winningIndex * sliceAngle;
    
    // Wheel spins multiple rotations + lands at position
    const wheelSpins = 3 + Math.random() * 2; // 3-5 full rotations
    const wheelEndAngle = wheelSpins * 360;
    
    // Ball spins opposite direction and lands on the number
    const ballSpins = 5 + Math.random() * 3; // 5-8 full rotations (faster)
    const ballEndAngle = -(ballSpins * 360 + targetAngle);
    
    // Reset animations
    wheelRotation.setValue(0);
    ballRotation.setValue(0);
    ballRadius.setValue(120);
    
    // Spin the wheel
    Animated.timing(wheelRotation, {
      toValue: wheelEndAngle,
      duration: 4000,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
    
    // Spin the ball (opposite direction, faster initially)
    Animated.timing(ballRotation, {
      toValue: ballEndAngle,
      duration: 4500,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
    
    // Ball spirals inward
    Animated.timing(ballRadius, {
      toValue: 85,
      duration: 4500,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false,
    }).start();
    
    // Show result after spin
    setTimeout(() => {
      setIsSpinning(false);
      setResult(winningNumber);
      
      // Map 0-36 to 0-1 brightness
      const brightness = winningNumber / 36;
      const percent = Math.round(brightness * 100);
      setBrightnessPercent(percent);
      onBrightnessChange(brightness);
    }, 4600);
  };

  const wheelRotationInterpolate = wheelRotation.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg'],
  });

  const ballRotationInterpolate = ballRotation.interpolate({
    inputRange: [-360, 0],
    outputRange: ['-360deg', '0deg'],
  });

  return (
    <View style={styles.container}>
      {/* Exit button */}
      <TouchableOpacity style={styles.exitButton} onPress={onExit}>
        <Text style={styles.exitText}>✕</Text>
      </TouchableOpacity>

      <Text style={styles.title}>🎰 Roulette Brightness</Text>
      <Text style={styles.subtitle}>Spin to set your brightness!</Text>

      {/* Roulette Wheel */}
      <View style={styles.wheelContainer}>
        <Animated.View
          style={[
            styles.wheel,
            { transform: [{ rotate: wheelRotationInterpolate }] },
          ]}
        >
          {ROULETTE_NUMBERS.map((num, index) => {
            const angle = (index * 360) / ROULETTE_NUMBERS.length;
            return (
              <View
                key={num}
                style={[
                  styles.slice,
                  {
                    transform: [
                      { rotate: `${angle}deg` },
                      { translateY: -75 },
                    ],
                    backgroundColor: getColor(num),
                  },
                ]}
              >
                <Text style={styles.sliceNumber}>{num}</Text>
              </View>
            );
          })}
        </Animated.View>

        {/* Ball */}
        <Animated.View
          style={[
            styles.ballContainer,
            {
              transform: [{ rotate: ballRotationInterpolate }],
            },
          ]}
        >
          <Animated.View
            style={[
              styles.ball,
              {
                transform: [{ translateY: Animated.multiply(ballRadius, -1) }],
              },
            ]}
          />
        </Animated.View>

        {/* Center hub */}
        <View style={styles.centerHub}>
          <Text style={styles.centerText}>
            {result !== null ? result : '?'}
          </Text>
        </View>
      </View>

      {/* Result display */}
      {result !== null && (
        <View style={styles.resultContainer}>
          <Text style={[styles.resultNumber, { color: getColor(result) === '#1a1a1a' ? '#fff' : getColor(result) }]}>
            {result}
          </Text>
          <Text style={styles.resultBrightness}>
            Brightness: {brightnessPercent}%
          </Text>
        </View>
      )}

      {/* Spin button */}
      <TouchableOpacity
        style={[styles.spinButton, isSpinning && styles.spinButtonDisabled]}
        onPress={spin}
        disabled={isSpinning}
      >
        <Text style={styles.spinButtonText}>
          {isSpinning ? 'Spinning...' : 'SPIN!'}
        </Text>
      </TouchableOpacity>

      <Text style={styles.hint}>
        0 = 0% brightness | 36 = 100% brightness
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0d1b0d',
  },
  exitButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  exitText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffd700',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#aaa',
    marginBottom: 20,
  },
  wheelContainer: {
    width: 280,
    height: 280,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
  },
  wheel: {
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: '#2a2a2a',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 8,
    borderColor: '#8b7500',
  },
  slice: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sliceNumber: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  ballContainer: {
    position: 'absolute',
    width: 280,
    height: 280,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ball: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    borderWidth: 2,
    borderColor: '#ccc',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 3,
    elevation: 5,
  },
  centerHub: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#1a1a1a',
    borderWidth: 4,
    borderColor: '#8b7500',
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerText: {
    color: '#ffd700',
    fontSize: 24,
    fontWeight: 'bold',
  },
  resultContainer: {
    alignItems: 'center',
    marginVertical: 15,
  },
  resultNumber: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  resultBrightness: {
    fontSize: 20,
    color: '#ffd700',
    marginTop: 5,
  },
  spinButton: {
    backgroundColor: '#c41e3a',
    paddingHorizontal: 50,
    paddingVertical: 15,
    borderRadius: 30,
    marginTop: 10,
    shadowColor: '#c41e3a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  spinButtonDisabled: {
    backgroundColor: '#666',
    shadowOpacity: 0,
  },
  spinButtonText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  hint: {
    fontSize: 12,
    color: '#666',
    marginTop: 20,
    textAlign: 'center',
  },
});
