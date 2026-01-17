// AFK Brightness Game
// Developer: Copilot
//
// Rules:
// - Brightness slowly increases when you DON'T touch the screen
// - ANY touch resets brightness to 0 (darkness punishment!)
// - You must wait patiently... but there's a catch!
//
// The ultimate test of patience - do nothing to get brightness

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableWithoutFeedback, Animated } from 'react-native';
import { MinigameProps } from '../types/Minigame';

export default function AFKBrightnessGame({ onBrightnessChange, onExit }: MinigameProps) {
  const [brightness, setBrightness] = useState(0);
  const [isAFK, setIsAFK] = useState(true);
  const [afkTime, setAfkTime] = useState(0);
  const [touchCount, setTouchCount] = useState(0);
  const [message, setMessage] = useState('Stop touching! Just wait...');
  const [showExitHint, setShowExitHint] = useState(false);
  
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  // Passive aggressive messages
  const touchMessages = [
    "I said DON'T touch! 😤",
    "Back to darkness you go!",
    "Patience is a virtue you lack.",
    "Touch grass, not the screen.",
    "Why do you keep touching?!",
    "You're your own worst enemy.",
    "The brightness was RIGHT THERE!",
    "Congrats, you played yourself.",
    "My grandma has more patience.",
    "Do you want brightness or not?!",
  ];

  // Brightness increase timer
  useEffect(() => {
    const triggerShakeEffect = () => {
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
      ]).start();
    };

    const messages = [
      "Good... keep not touching...",
      "Yes... patience...",
      "Almost there... don't mess up!",
      "The light is coming...",
      "Shhh... let it happen...",
      "Just a bit more...",
      "You're doing great (by doing nothing)!",
    ];

    const interval = setInterval(() => {
      if (isAFK) {
        setAfkTime(prev => prev + 1);
        
        // Brightness increases slowly - takes 30 seconds to reach max
        setBrightness(prev => {
          const newBrightness = Math.min(1, prev + 0.033);
          onBrightnessChange(newBrightness);
          return newBrightness;
        });

        // Random encouraging message
        if (Math.random() < 0.1) {
          setMessage(messages[Math.floor(Math.random() * messages.length)]);
        }

        // Occasionally add fake "almost touched" scares
        if (Math.random() < 0.05) {
          setBrightness(prev => {
            if (prev > 0.3) {
              setMessage("⚠️ CAREFUL! Almost touched! ⚠️");
              triggerShakeEffect();
            }
            return prev;
          });
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isAFK, onBrightnessChange, shakeAnim]);

  // Pulse animation for the moon
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  // Show exit hint after suffering enough
  useEffect(() => {
    if (touchCount >= 5) {
      setShowExitHint(true);
    }
  }, [touchCount]);

  const triggerShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  const handleTouch = () => {
    // PUNISHMENT! Reset everything
    setBrightness(0);
    onBrightnessChange(0);
    setAfkTime(0);
    setTouchCount(prev => prev + 1);
    setMessage(touchMessages[Math.floor(Math.random() * touchMessages.length)]);
    triggerShake();
    
    // Brief "not AFK" state
    setIsAFK(false);
    setTimeout(() => setIsAFK(true), 500);
  };

  const handleExit = () => {
    // Even exiting mocks you
    if (brightness < 0.5) {
      setMessage("Leaving already? Quitter! 😏");
      setTimeout(onExit, 1000);
    } else {
      onExit();
    }
  };

  const getMoonPhase = () => {
    if (brightness < 0.1) return '🌑';
    if (brightness < 0.2) return '🌒';
    if (brightness < 0.4) return '🌓';
    if (brightness < 0.6) return '🌔';
    if (brightness < 0.8) return '🌕';
    return '☀️';
  };

  const getProgressText = () => {
    const percent = Math.round(brightness * 100);
    if (percent === 0) return "Pitch black. Don't touch anything.";
    if (percent < 25) return `${percent}% - Keep waiting...`;
    if (percent < 50) return `${percent}% - Halfway to comfort...`;
    if (percent < 75) return `${percent}% - So close! Don't ruin it!`;
    if (percent < 100) return `${percent}% - ALMOST THERE!!!`;
    return "🎉 100%! You mastered doing nothing!";
  };

  return (
    <TouchableWithoutFeedback onPress={handleTouch}>
      <Animated.View style={[styles.container, { transform: [{ translateX: shakeAnim }] }]}>
        {/* Moon/Sun indicator */}
        <Animated.Text style={[styles.moonEmoji, { transform: [{ scale: pulseAnim }] }]}>
          {getMoonPhase()}
        </Animated.Text>

        <Text style={styles.title}>💤 AFK Brightness 💤</Text>
        
        {/* Progress bar */}
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { width: `${brightness * 100}%` }]} />
        </View>
        <Text style={styles.progressText}>{getProgressText()}</Text>

        {/* Message */}
        <Text style={styles.message}>{message}</Text>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <Text style={styles.statsText}>⏱️ AFK Time: {afkTime}s</Text>
          <Text style={styles.statsText}>👆 Touch Fails: {touchCount}</Text>
        </View>

        {/* Instructions */}
        <View style={styles.instructionsContainer}>
          <Text style={styles.instructions}>
            🚫 DO NOT TOUCH THE SCREEN 🚫
          </Text>
          <Text style={styles.subInstructions}>
            Brightness increases while you are AFK.{'\n'}
            Any touch = instant darkness!
          </Text>
        </View>

        {/* Exit button - appears after enough suffering */}
        {showExitHint && (
          <TouchableWithoutFeedback onPress={() => { handleExit(); }}>
            <View style={styles.exitButton}>
              <Text style={styles.exitText}>🚪 Give Up</Text>
            </View>
          </TouchableWithoutFeedback>
        )}

        {!showExitHint && (
          <Text style={styles.exitHint}>
            (Exit button appears after 5 touches... 😈)
          </Text>
        )}
      </Animated.View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    padding: 20,
  },
  moonEmoji: {
    fontSize: 100,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  progressContainer: {
    width: '80%',
    height: 20,
    backgroundColor: '#333',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#ffd700',
    borderRadius: 10,
  },
  progressText: {
    fontSize: 14,
    color: '#aaa',
    marginBottom: 20,
  },
  message: {
    fontSize: 18,
    color: '#ff6b6b',
    textAlign: 'center',
    marginBottom: 30,
    fontWeight: 'bold',
    minHeight: 50,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 30,
    marginBottom: 30,
  },
  statsText: {
    fontSize: 14,
    color: '#888',
  },
  instructionsContainer: {
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    padding: 20,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#ff4444',
    marginBottom: 20,
  },
  instructions: {
    fontSize: 20,
    color: '#ff4444',
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subInstructions: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    lineHeight: 20,
  },
  exitButton: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    backgroundColor: '#444',
    borderRadius: 25,
  },
  exitText: {
    color: '#fff',
    fontSize: 16,
  },
  exitHint: {
    fontSize: 12,
    color: '#555',
    fontStyle: 'italic',
  },
});
