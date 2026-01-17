// Hold-to-Glow Game
// Like inflating a balloon - hold to increase, release to slowly deflate, pop at 100%!

import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import { MinigameProps } from '../types/Minigame';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const INCREASE_SPEED = 0.012; // How fast brightness increases per tick
const DECREASE_SPEED = 0.005; // How fast brightness decreases when released
const TICK_INTERVAL = 16; // ~60fps

export default function HoldToGlowGame({ onBrightnessChange }: MinigameProps) {
  const [isHolding, setIsHolding] = useState(false);
  const [displayBrightness, setDisplayBrightness] = useState(0);
  const [popped, setPopped] = useState(false);
  
  const brightnessRef = useRef(0);

  // Main game loop
  useEffect(() => {
    const interval = setInterval(() => {
      if (popped) return;

      if (isHolding) {
        // Increase brightness while holding
        brightnessRef.current += INCREASE_SPEED;
        
        // Check if balloon popped (reached or exceeded 100%)
        if (brightnessRef.current >= 1) {
          brightnessRef.current = 0;
          setDisplayBrightness(0);
          onBrightnessChange(0);
          setPopped(true);
          // Reset popped state after a moment
          setTimeout(() => setPopped(false), 1500);
          return;
        }
        
        setDisplayBrightness(brightnessRef.current);
        onBrightnessChange(brightnessRef.current);
      } else {
        // Slowly decrease brightness when not holding
        if (brightnessRef.current > 0) {
          brightnessRef.current = Math.max(0, brightnessRef.current - DECREASE_SPEED);
          setDisplayBrightness(brightnessRef.current);
          onBrightnessChange(brightnessRef.current);
        }
      }
    }, TICK_INTERVAL);

    return () => clearInterval(interval);
  }, [isHolding, popped, onBrightnessChange]);

  const handlePressIn = () => {
    if (!popped) {
      setIsHolding(true);
    }
  };

  const handlePressOut = () => {
    setIsHolding(false);
  };

  // Get balloon color based on brightness (green → yellow → red as danger increases)
  const getBalloonColor = () => {
    if (popped) return '#666';
    if (displayBrightness < 0.5) {
      return `rgb(${Math.round(displayBrightness * 2 * 255)}, 200, 100)`;
    } else {
      return `rgb(255, ${Math.round((1 - displayBrightness) * 2 * 200)}, ${Math.round((1 - displayBrightness) * 100)})`;
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.emoji}>{popped ? '💥' : '🎈'}</Text>
        <Text style={styles.title}>Hold-to-Glow</Text>
        <Text style={styles.subtitle}>
          {popped ? 'POP! Too much!' : `${Math.round(displayBrightness * 100)}%`}
        </Text>
      </View>

      {/* Hold button / Balloon */}
      <Pressable
        style={[
          styles.holdButton,
          { 
            backgroundColor: getBalloonColor(),
            transform: [{ scale: 0.8 + displayBrightness * 0.4 }],
          },
          popped && styles.poppedButton,
        ]}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={popped}
      >
        <Text style={[styles.holdText, popped && styles.poppedText]}>
          {popped ? 'POPPED!' : isHolding ? 'INFLATING...' : 'HOLD TO INFLATE'}
        </Text>
      </Pressable>

      {/* Danger indicator */}
      {displayBrightness > 0.7 && !popped && (
        <Text style={styles.dangerText}>⚠️ CAREFUL! ⚠️</Text>
      )}

      {/* Instructions */}
      <Text style={styles.instructions}>
        Hold to inflate the balloon.{'\n'}
        Release to slowly deflate.{'\n'}
        Don&apos;t pop it at 100%!
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
    marginBottom: 40,
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
    fontSize: 20,
    color: '#ffd700',
    marginTop: 5,
    fontWeight: 'bold',
  },
  holdButton: {
    width: SCREEN_WIDTH - 80,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#4ade80',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 40,
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  poppedButton: {
    backgroundColor: '#333',
    borderColor: '#444',
  },
  holdText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
  },
  poppedText: {
    color: '#888',
  },
  dangerText: {
    fontSize: 20,
    color: '#ef4444',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  instructions: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    lineHeight: 22,
    marginTop: 20,
    paddingHorizontal: 30,
  },
});
