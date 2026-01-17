// Ball-in-a-Box Game
// Developer: Copilot
//
// Rules:
// - Drag to move the ball around the box
// - Ball Y position = brightness (top = bright, bottom = dark)
// - But wait... the ball has physics! It rolls and bounces!
// - Good luck keeping it where you want it!

import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, PanResponder, Animated, Dimensions, TouchableOpacity } from 'react-native';
import { MinigameProps } from '../types/Minigame';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BOX_SIZE = Math.min(SCREEN_WIDTH - 60, 320);
const BALL_SIZE = 50;
const FRICTION = 0.98;
const BOUNCE = 0.7;
const GRAVITY = 0.3;

export default function BallInBoxGame({ onBrightnessChange, onExit }: MinigameProps) {
  const [brightness, setBrightness] = useState(0.5);
  const [isDragging, setIsDragging] = useState(false);
  const [chaosMode, setChaosMode] = useState(false);
  const [earthquakeActive, setEarthquakeActive] = useState(false);
  
  // Ball position and velocity
  const ballX = useRef(BOX_SIZE / 2 - BALL_SIZE / 2);
  const ballY = useRef(BOX_SIZE / 2 - BALL_SIZE / 2);
  const velocityX = useRef(0);
  const velocityY = useRef(0);
  
  const ballAnim = useRef(new Animated.ValueXY({ 
    x: BOX_SIZE / 2 - BALL_SIZE / 2, 
    y: BOX_SIZE / 2 - BALL_SIZE / 2 
  })).current;
  
  const boxShake = useRef(new Animated.Value(0)).current;

  // Physics simulation
  useEffect(() => {
    const physics = setInterval(() => {
      if (isDragging) return;

      // Apply gravity
      velocityY.current += GRAVITY;
      
      // Apply chaos mode - random forces!
      if (chaosMode) {
        velocityX.current += (Math.random() - 0.5) * 2;
        velocityY.current += (Math.random() - 0.5) * 2;
      }

      // Apply earthquake - strong random forces!
      if (earthquakeActive) {
        velocityX.current += (Math.random() - 0.5) * 8;
        velocityY.current += (Math.random() - 0.5) * 8;
      }

      // Apply friction
      velocityX.current *= FRICTION;
      velocityY.current *= FRICTION;

      // Update position
      let newX = ballX.current + velocityX.current;
      let newY = ballY.current + velocityY.current;

      // Bounce off walls
      if (newX < 0) {
        newX = 0;
        velocityX.current = -velocityX.current * BOUNCE;
      } else if (newX > BOX_SIZE - BALL_SIZE) {
        newX = BOX_SIZE - BALL_SIZE;
        velocityX.current = -velocityX.current * BOUNCE;
      }

      if (newY < 0) {
        newY = 0;
        velocityY.current = -velocityY.current * BOUNCE;
      } else if (newY > BOX_SIZE - BALL_SIZE) {
        newY = BOX_SIZE - BALL_SIZE;
        velocityY.current = -velocityY.current * BOUNCE;
      }

      ballX.current = newX;
      ballY.current = newY;

      ballAnim.setValue({ x: newX, y: newY });

      // Calculate brightness based on Y position (inverted - top is bright)
      const newBrightness = 1 - (newY / (BOX_SIZE - BALL_SIZE));
      setBrightness(newBrightness);
      onBrightnessChange(newBrightness);
    }, 16);

    return () => clearInterval(physics);
  }, [isDragging, chaosMode, earthquakeActive, ballAnim, onBrightnessChange]);

  // Random earthquakes
  useEffect(() => {
    const doEarthquake = () => {
      setEarthquakeActive(true);
      
      // Shake the box
      Animated.sequence([
        Animated.timing(boxShake, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(boxShake, { toValue: -10, duration: 50, useNativeDriver: true }),
        Animated.timing(boxShake, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(boxShake, { toValue: -10, duration: 50, useNativeDriver: true }),
        Animated.timing(boxShake, { toValue: 5, duration: 50, useNativeDriver: true }),
        Animated.timing(boxShake, { toValue: -5, duration: 50, useNativeDriver: true }),
        Animated.timing(boxShake, { toValue: 0, duration: 50, useNativeDriver: true }),
      ]).start();

      setTimeout(() => setEarthquakeActive(false), 500);
    };

    const earthquakeTimer = setInterval(() => {
      if (Math.random() < 0.1) { // 10% chance every 3 seconds
        doEarthquake();
      }
    }, 3000);

    return () => clearInterval(earthquakeTimer);
  }, [boxShake]);

  const triggerEarthquake = () => {
    setEarthquakeActive(true);
    
    // Shake the box
    Animated.sequence([
      Animated.timing(boxShake, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(boxShake, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(boxShake, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(boxShake, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(boxShake, { toValue: 5, duration: 50, useNativeDriver: true }),
      Animated.timing(boxShake, { toValue: -5, duration: 50, useNativeDriver: true }),
      Animated.timing(boxShake, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();

    setTimeout(() => setEarthquakeActive(false), 500);
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        setIsDragging(true);
        velocityX.current = 0;
        velocityY.current = 0;
      },
      onPanResponderMove: (_, gesture) => {
        let newX = ballX.current + gesture.dx * 0.1;
        let newY = ballY.current + gesture.dy * 0.1;

        // Clamp to box bounds
        newX = Math.max(0, Math.min(BOX_SIZE - BALL_SIZE, newX));
        newY = Math.max(0, Math.min(BOX_SIZE - BALL_SIZE, newY));

        ballX.current = newX;
        ballY.current = newY;
        ballAnim.setValue({ x: newX, y: newY });

        // Store velocity for when released
        velocityX.current = gesture.vx * 3;
        velocityY.current = gesture.vy * 3;

        // Update brightness
        const newBrightness = 1 - (newY / (BOX_SIZE - BALL_SIZE));
        setBrightness(newBrightness);
        onBrightnessChange(newBrightness);
      },
      onPanResponderRelease: () => {
        setIsDragging(false);
        // Ball will continue with stored velocity due to physics
      },
    })
  ).current;

  const getBallEmoji = () => {
    if (earthquakeActive) return '😵';
    if (isDragging) return '😰';
    if (brightness > 0.8) return '😎';
    if (brightness < 0.2) return '😢';
    return '🔵';
  };

  const getMessage = () => {
    if (earthquakeActive) return '🌋 EARTHQUAKE! 🌋';
    if (chaosMode) return '🌀 CHAOS MODE ACTIVE 🌀';
    if (isDragging) return 'Keep it steady...';
    if (brightness > 0.9) return 'Perfect! Now hold it... oh wait, gravity.';
    if (brightness < 0.1) return 'The ball sank to the bottom...';
    return 'Drag ball up for brightness!';
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📦 Ball-in-a-Box 📦</Text>
      <Text style={styles.subtitle}>Drag ball up = Bright | Ball falls down = Dark</Text>

      {/* Brightness indicator */}
      <View style={styles.brightnessBar}>
        <View style={[styles.brightnessLevel, { width: `${brightness * 100}%` }]} />
      </View>
      <Text style={styles.brightnessText}>{Math.round(brightness * 100)}% Brightness</Text>

      {/* The Box */}
      <Animated.View 
        style={[
          styles.box, 
          { transform: [{ translateX: boxShake }] }
        ]}
        {...panResponder.panHandlers}
      >
        {/* Grid lines for visual effect */}
        <View style={styles.gridContainer}>
          {[...Array(5)].map((_, i) => (
            <View key={`h${i}`} style={[styles.gridLine, { top: `${(i + 1) * 20}%` }]} />
          ))}
        </View>
        
        {/* Brightness zones */}
        <View style={[styles.zone, styles.brightZone]}>
          <Text style={styles.zoneText}>☀️ BRIGHT</Text>
        </View>
        <View style={[styles.zone, styles.darkZone]}>
          <Text style={styles.zoneText}>🌑 DARK</Text>
        </View>

        {/* The Ball */}
        <Animated.View
          style={[
            styles.ball,
            {
              transform: [
                { translateX: ballAnim.x },
                { translateY: ballAnim.y },
              ],
            },
          ]}
        >
          <Text style={styles.ballEmoji}>{getBallEmoji()}</Text>
        </Animated.View>
      </Animated.View>

      {/* Message */}
      <Text style={[styles.message, earthquakeActive && styles.earthquakeText]}>
        {getMessage()}
      </Text>

      {/* Chaos Mode Toggle */}
      <TouchableOpacity 
        style={[styles.chaosButton, chaosMode && styles.chaosButtonActive]}
        onPress={() => setChaosMode(!chaosMode)}
      >
        <Text style={styles.chaosButtonText}>
          {chaosMode ? '🌀 Disable Chaos' : '🎲 Enable Chaos Mode'}
        </Text>
      </TouchableOpacity>

      {/* Manual Earthquake Button */}
      <TouchableOpacity 
        style={styles.earthquakeButton}
        onPress={triggerEarthquake}
      >
        <Text style={styles.earthquakeButtonText}>🌋 Trigger Earthquake</Text>
      </TouchableOpacity>

      {/* Exit Button */}
      <TouchableOpacity style={styles.exitButton} onPress={onExit}>
        <Text style={styles.exitText}>🚪 Exit</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    paddingTop: 40,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
    marginBottom: 15,
  },
  brightnessBar: {
    width: '80%',
    height: 15,
    backgroundColor: '#333',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 5,
  },
  brightnessLevel: {
    height: '100%',
    backgroundColor: '#ffd700',
    borderRadius: 10,
  },
  brightnessText: {
    fontSize: 14,
    color: '#aaa',
    marginBottom: 20,
  },
  box: {
    width: BOX_SIZE,
    height: BOX_SIZE,
    backgroundColor: '#2d2d5a',
    borderRadius: 15,
    borderWidth: 4,
    borderColor: '#ffd700',
    overflow: 'hidden',
    position: 'relative',
  },
  gridContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  zone: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  brightZone: {
    top: 0,
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
  },
  darkZone: {
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  zoneText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
  },
  ball: {
    position: 'absolute',
    width: BALL_SIZE,
    height: BALL_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ballEmoji: {
    fontSize: 40,
  },
  message: {
    fontSize: 16,
    color: '#fff',
    marginTop: 20,
    marginBottom: 15,
    textAlign: 'center',
    minHeight: 25,
  },
  earthquakeText: {
    color: '#ff4444',
    fontWeight: 'bold',
  },
  chaosButton: {
    paddingVertical: 10,
    paddingHorizontal: 25,
    backgroundColor: '#444',
    borderRadius: 20,
    marginBottom: 10,
  },
  chaosButtonActive: {
    backgroundColor: '#8b0000',
  },
  chaosButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  earthquakeButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    backgroundColor: '#663300',
    borderRadius: 20,
    marginBottom: 15,
  },
  earthquakeButtonText: {
    color: '#fff',
    fontSize: 12,
  },
  exitButton: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    backgroundColor: '#333',
    borderRadius: 25,
  },
  exitText: {
    color: '#fff',
    fontSize: 16,
  },
});
