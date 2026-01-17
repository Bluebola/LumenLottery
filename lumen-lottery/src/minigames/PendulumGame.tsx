// Pendulum Dimmer Game
// Brightness sampled only at lowest point - time your tap perfectly!
// Developer: Lumen Lottery Team

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Animated } from 'react-native';
import { MinigameProps } from '../types/Minigame';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const PENDULUM_LENGTH = 200;
const BOB_SIZE = 50;
const PIVOT_Y = 120;
const MAX_ANGLE = 60; // degrees

export default function PendulumGame({ onBrightnessChange, onExit }: MinigameProps) {
  const [angle, setAngle] = useState(MAX_ANGLE);
  const [angularVelocity, setAngularVelocity] = useState(0);
  const [brightness, setBrightness] = useState(0.5);
  const [lastSample, setLastSample] = useState<{ change: number; accuracy: string } | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [perfectHits, setPerfectHits] = useState(0);
  const [showMissMessage, setShowMissMessage] = useState(false);
  
  const animatedAngle = useRef(new Animated.Value(MAX_ANGLE)).current;
  const angleRef = useRef(angle);
  const velocityRef = useRef(angularVelocity);
  const brightnessRef = useRef(brightness);
  const speedMultiplierRef = useRef(1);
  const [speedLabel, setSpeedLabel] = useState('Normal');

  // Physics constants
  const baseGravity = 0.5;

  // Update refs
  useEffect(() => {
    angleRef.current = angle;
  }, [angle]);

  useEffect(() => {
    velocityRef.current = angularVelocity;
  }, [angularVelocity]);

  useEffect(() => {
    brightnessRef.current = brightness;
  }, [brightness]);

  // Pendulum physics simulation with random speed changes
  useEffect(() => {
    const interval = setInterval(() => {
      // Simple pendulum physics with speed multiplier
      const gravity = baseGravity * speedMultiplierRef.current;
      const acceleration = -gravity * Math.sin(angleRef.current * Math.PI / 180);
      let newVelocity = velocityRef.current + acceleration;
      let newAngle = angleRef.current + newVelocity;

      setAngularVelocity(newVelocity);
      setAngle(newAngle);
      animatedAngle.setValue(newAngle);
    }, 16); // ~60fps

    return () => clearInterval(interval);
  }, []);

  // Random speed changes
  useEffect(() => {
    const changeSpeed = () => {
      const speeds = [
        { multiplier: 0.5, label: '🐌 Slow' },
        { multiplier: 0.75, label: '🚶 Slower' },
        { multiplier: 1, label: '🏃 Normal' },
        { multiplier: 1.25, label: '🏎️ Fast' },
        { multiplier: 1.5, label: '⚡ Faster' },
        { multiplier: 2, label: '🚀 CRAZY!' },
      ];
      const randomSpeed = speeds[Math.floor(Math.random() * speeds.length)];
      speedMultiplierRef.current = randomSpeed.multiplier;
      setSpeedLabel(randomSpeed.label);
    };

    // Change speed randomly every 2-5 seconds
    const scheduleNextChange = () => {
      const delay = 2000 + Math.random() * 3000;
      return setTimeout(() => {
        changeSpeed();
        timerId = scheduleNextChange();
      }, delay);
    };

    let timerId = scheduleNextChange();

    return () => clearTimeout(timerId);
  }, []);

  // Initial brightness
  useEffect(() => {
    onBrightnessChange(brightness);
  }, []);

  // Calculate position from angle
  const getBobPosition = (angleDeg: number) => {
    const angleRad = angleDeg * Math.PI / 180;
    const x = SCREEN_WIDTH / 2 + Math.sin(angleRad) * PENDULUM_LENGTH;
    const y = PIVOT_Y + Math.cos(angleRad) * PENDULUM_LENGTH;
    return { x, y };
  };

  // Calculate how close to bottom (0 = at bottom, 1 = at max swing)
  const getSwingProgress = (angleDeg: number) => {
    return Math.abs(angleDeg) / MAX_ANGLE;
  };

  // Sample brightness - hit = increase, miss = decrease!
  const handleTap = () => {
    const currentAngle = angleRef.current;
    const swingProgress = getSwingProgress(currentAngle);
    const currentBrightness = brightnessRef.current;
    
    setAttempts(prev => prev + 1);
    
    // Determine accuracy based on how close to bottom
    let accuracy: string;
    let brightnessChange: number;
    let newBrightness: number;
    
    if (swingProgress < 0.1) {
      // Perfect! At the bottom - big increase
      accuracy = "PERFECT! 🎯 +20%";
      brightnessChange = 0.2;
      setPerfectHits(prev => prev + 1);
      setShowMissMessage(false);
    } else if (swingProgress < 0.25) {
      // Good - close to bottom - small increase
      accuracy = "Good! ✨ +10%";
      brightnessChange = 0.1;
      setShowMissMessage(false);
    } else if (swingProgress < 0.5) {
      // Okay - not great - small decrease
      accuracy = "Too early/late 😅 -5%";
      brightnessChange = -0.05;
      setShowMissMessage(true);
    } else {
      // Miss - way off - bigger decrease
      accuracy = "MISSED! 💨 -15%";
      brightnessChange = -0.15;
      setShowMissMessage(true);
    }
    
    newBrightness = Math.max(0.05, Math.min(1, currentBrightness + brightnessChange));
    
    setLastSample({ change: brightnessChange, accuracy });
    setBrightness(newBrightness);
    onBrightnessChange(newBrightness);
  };

  const bobPos = getBobPosition(angle);
  const swingProgress = getSwingProgress(angle);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🎯 Pendulum Dimmer</Text>
        <Text style={styles.instruction}>
          Tap when the pendulum is at the BOTTOM!
        </Text>
        <Text style={styles.current}>
          💡 Brightness: {Math.round(brightness * 100)}%
        </Text>
        <Text style={styles.rules}>
          ✅ Hit = Brighter | ❌ Miss = Darker
        </Text>
      </View>

      <TouchableOpacity 
        style={styles.pendulumArea} 
        onPress={handleTap}
        activeOpacity={1}
      >
        {/* Pivot point */}
        <View style={styles.pivot} />
        
        {/* Pendulum string */}
        <View
          style={[
            styles.string,
            {
              width: 2,
              height: PENDULUM_LENGTH,
              left: SCREEN_WIDTH / 2 - 1,
              top: PIVOT_Y,
              transform: [{ rotate: `${angle}deg` }],
              transformOrigin: 'top center',
            },
          ]}
        />
        
        {/* Pendulum bob */}
        <View
          style={[
            styles.bob,
            {
              left: bobPos.x - BOB_SIZE / 2,
              top: bobPos.y - BOB_SIZE / 2,
              backgroundColor: swingProgress < 0.1 ? '#4ade80' : 
                              swingProgress < 0.25 ? '#ffd700' : '#666',
            },
          ]}
        >
          <Text style={styles.bobEmoji}>
            {swingProgress < 0.1 ? '✨' : '🔮'}
          </Text>
        </View>

        {/* Sweet spot indicator */}
        <View style={styles.sweetSpot}>
          <Text style={styles.sweetSpotText}>▼ TAP HERE ▼</Text>
        </View>

        {/* Swing progress indicator */}
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { width: `${(1 - swingProgress) * 100}%` }]} />
        </View>
        <Text style={styles.progressLabel}>
          {swingProgress < 0.1 ? '🎯 NOW!' : swingProgress < 0.25 ? 'Almost...' : 'Wait for it...'}
        </Text>
      </TouchableOpacity>

      {/* Last sample result */}
      {lastSample && (
        <View style={[styles.resultContainer, { 
          backgroundColor: lastSample.change > 0 ? '#1a3a1a' : '#3a1a1a' 
        }]}>
          <Text style={styles.resultAccuracy}>{lastSample.accuracy}</Text>
          <Text style={styles.resultBrightness}>
            Now at {Math.round(brightness * 100)}%
          </Text>
          {showMissMessage && (
            <Text style={styles.missHint}>
              Wait for the green glow! 💚
            </Text>
          )}
        </View>
      )}

      {/* Stats */}
      <View style={styles.stats}>
        <Text style={styles.statText}>
          Attempts: {attempts} | Perfect: {perfectHits}
        </Text>
        {attempts > 0 && (
          <Text style={styles.statText}>
            Accuracy: {Math.round((perfectHits / attempts) * 100)}%
          </Text>
        )}
      </View>

      {/* Speed indicator */}
      <View style={styles.speedIndicator}>
        <Text style={styles.speedText}>{speedLabel}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0f',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffd700',
    marginBottom: 8,
  },
  instruction: {
    fontSize: 14,
    color: '#888',
    marginBottom: 4,
  },
  target: {
    fontSize: 16,
    color: '#4ade80',
    fontWeight: '600',
  },
  current: {
    fontSize: 18,
    color: '#ffd700',
    fontWeight: 'bold',
    marginTop: 4,
  },
  rules: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
  },
  pendulumArea: {
    width: SCREEN_WIDTH,
    height: 350,
    position: 'relative',
  },
  pivot: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#444',
    left: SCREEN_WIDTH / 2 - 10,
    top: PIVOT_Y - 10,
    zIndex: 10,
  },
  string: {
    position: 'absolute',
    backgroundColor: '#666',
  },
  bob: {
    position: 'absolute',
    width: BOB_SIZE,
    height: BOB_SIZE,
    borderRadius: BOB_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  bobEmoji: {
    fontSize: 24,
  },
  sweetSpot: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  sweetSpotText: {
    fontSize: 14,
    color: '#4ade80',
    fontWeight: 'bold',
  },
  progressContainer: {
    position: 'absolute',
    bottom: 10,
    left: 40,
    right: 40,
    height: 8,
    backgroundColor: '#333',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4ade80',
    borderRadius: 4,
  },
  progressLabel: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 18,
    color: '#ffd700',
    fontWeight: 'bold',
  },
  resultContainer: {
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    marginVertical: 10,
    minWidth: 200,
  },
  resultAccuracy: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  resultBrightness: {
    fontSize: 16,
    color: '#888',
    marginTop: 4,
  },
  missHint: {
    fontSize: 14,
    color: '#ef4444',
    marginTop: 8,
    fontStyle: 'italic',
  },
  stats: {
    alignItems: 'center',
    marginTop: 10,
  },
  statText: {
    fontSize: 14,
    color: '#666',
  },
  speedIndicator: {
    marginTop: 15,
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: '#2a2a3e',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#444',
  },
  speedText: {
    fontSize: 16,
    color: '#ffd700',
    fontWeight: 'bold',
  },
});
