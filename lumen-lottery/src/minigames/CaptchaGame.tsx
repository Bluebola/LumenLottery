// Captcha Dimmer Game - NIGHTMARE EDITION
// Developer: Copilot
//
// Rules:
// - Select all squares containing the target object
// - Every mistake drops brightness significantly
// - Correct answers barely increase brightness
// - Captcha reloads ENDLESSLY - you can never truly win!
// - HARD MODE: Timer, shuffling grid, fading squares, multi-step verification!

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { MinigameProps } from '../types/Minigame';

// Captcha challenges with emoji grids - 16 squares now (4x4)!
const CHALLENGES = [
  {
    prompt: 'Select all squares with TRAFFIC LIGHTS',
    grid: ['🚦', '🌳', '🏠', '🚗', '🚦', '🌳', '🏢', '🚶', '🚦', '🌲', '🏪', '🚙', '🚦', '🏠', '🌳', '🚗'],
    targets: [0, 4, 8, 12],
    ambiguous: false,
  },
  {
    prompt: 'Select all squares with VEHICLES (cars, trucks, buses)',
    grid: ['🚗', '🚙', '🚕', '🏠', '🚗', '🌳', '🚐', '🚶', '🏢', '🚌', '🚎', '🌲', '🚛', '🏪', '🚗', '🚲'],
    targets: [0, 1, 2, 4, 6, 9, 10, 12, 14], // Is a bike a vehicle? NO! But users might think so
    ambiguous: true,
  },
  {
    prompt: 'Select all squares with BUILDINGS',
    grid: ['🏠', '🌳', '🏢', '🚗', '🏪', '🌲', '🏬', '🚶', '🏠', '🚦', '🏭', '🌳', '🏢', '🚙', '⛪', '🏠'],
    targets: [0, 2, 4, 6, 8, 10, 12, 14, 15],
    ambiguous: true, // Is a church a building? Is a factory?
  },
  {
    prompt: 'Select all squares with NATURE (trees, mountains)',
    grid: ['🌳', '🏠', '🌲', '🚗', '⛰️', '🏢', '🌳', '🚶', '🏔️', '🚦', '🌲', '🌳', '🗻', '🚙', '🌴', '🏠'],
    targets: [0, 2, 4, 6, 8, 10, 11, 12, 14],
    ambiguous: true,
  },
  {
    prompt: 'Select all squares with RED objects',
    grid: ['🚗', '🔴', '🍎', '🏠', '❤️', '🌳', '🚒', '🚶', '🍓', '🚦', '🌹', '🚙', '🎈', '🏢', '🍒', '🔵'],
    targets: [0, 1, 2, 4, 6, 8, 10, 12, 14], // Red car counts! But is a traffic light red?
    ambiguous: true,
  },
  {
    prompt: 'Select ONLY the squares with EXACTLY one object',
    grid: ['🚗', '🚗🚗', '🌳', '🏠🏠', '🚦', '🌳🌳🌳', '🏢', '🚶🚶', '🚗', '🌲', '🏪🏪', '🚙', '🚦🚦', '🏠', '🌳', '🚗🚗🚗'],
    targets: [0, 2, 4, 6, 8, 9, 11, 13, 14],
    ambiguous: true,
  },
];

const LOADING_MESSAGES = [
  'Verifying you are human...',
  'Checking selection...',
  'Analyzing pixels...',
  'Consulting the AI overlords...',
  'Judging your life choices...',
  'Processing... please wait...',
  'Comparing to 10,000 other humans...',
  'Running neural network analysis...',
];

const FAIL_MESSAGES = [
  'Wrong! Try again. 🤖',
  'Incorrect. Are you a robot?',
  'Nope! The AI disagrees.',
  'Failed verification.',
  'Error: Human not detected.',
  'A robot would have done better.',
  'Selection rejected. Shame.',
  'Try harder, human.',
];

const SUCCESS_MESSAGES = [
  'Correct! But wait, there is more...',
  'Verified! But are you REALLY human?',
  'Good job! Here is another one.',
  'Success! Now do it again.',
  'Nice! But we need MORE verification...',
  'Almost done! (Just kidding)',
];

const TIMER_MESSAGES = [
  '⏰ TIME IS RUNNING OUT!',
  '⏰ HURRY UP!',
  '⏰ TICK TOCK...',
  '⏰ FASTER!',
];

export default function CaptchaGame({ onBrightnessChange, onExit }: MinigameProps) {
  const [brightness, setBrightness] = useState(0.5);
  const [currentChallenge, setCurrentChallenge] = useState(CHALLENGES[0]);
  const [displayGrid, setDisplayGrid] = useState(CHALLENGES[0].grid);
  const [selectedSquares, setSelectedSquares] = useState<number[]>([]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [message, setMessage] = useState('Prove you are human to adjust brightness');
  const [completedCount, setCompletedCount] = useState(0);
  const [failCount, setFailCount] = useState(0);
  const [showFakeError, setShowFakeError] = useState(false);
  
  // HARD MODE features
  const [timeLeft, setTimeLeft] = useState(15);
  const [hiddenSquares, setHiddenSquares] = useState<number[]>([]);
  const [verificationStep, setVerificationStep] = useState(1);
  const [totalSteps, setTotalSteps] = useState(1);
  const [robotCheckbox, setRobotCheckbox] = useState(false);
  const [sliderValue, setSliderValue] = useState(0);
  const [targetSliderValue, setTargetSliderValue] = useState(50);
  
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const squareAnims = useRef(CHALLENGES[0].grid.map(() => new Animated.Value(1))).current;

  // Timer countdown
  useEffect(() => {
    if (isVerifying) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // Time's up! Punish the user - inline to avoid dep issues
          setBrightness(b => {
            const newB = Math.max(0, b - 0.2);
            onBrightnessChange(newB);
            return newB;
          });
          setFailCount(f => f + 1);
          setMessage('⏰ TIME UP! -20% brightness');
          setSelectedSquares([]);
          setRobotCheckbox(false);
          return 15;
        }
        if (prev <= 5) {
          setMessage(TIMER_MESSAGES[Math.floor(Math.random() * TIMER_MESSAGES.length)]);
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isVerifying, onBrightnessChange]);

  // Random square hiding effect
  useEffect(() => {
    const hideInterval = setInterval(() => {
      if (isVerifying) return;
      
      // Randomly hide 1-3 squares temporarily
      const numToHide = Math.floor(Math.random() * 3) + 1;
      const toHide: number[] = [];
      for (let i = 0; i < numToHide; i++) {
        toHide.push(Math.floor(Math.random() * 16));
      }
      setHiddenSquares(toHide);
      
      // Fade out animation
      toHide.forEach(idx => {
        if (squareAnims[idx]) {
          Animated.timing(squareAnims[idx], {
            toValue: 0.2,
            duration: 200,
            useNativeDriver: true,
          }).start();
        }
      });
      
      // Reveal after a short time
      setTimeout(() => {
        toHide.forEach(idx => {
          if (squareAnims[idx]) {
            Animated.timing(squareAnims[idx], {
              toValue: 1,
              duration: 200,
              useNativeDriver: true,
            }).start();
          }
        });
        setHiddenSquares([]);
      }, 800);
    }, 3000);

    return () => clearInterval(hideInterval);
  }, [isVerifying, squareAnims]);

  // Random grid shuffle
  useEffect(() => {
    const shuffleInterval = setInterval(() => {
      if (isVerifying || Math.random() > 0.3) return; // 30% chance to shuffle
      
      // Shuffle the display grid but keep track of original positions
      const indices = displayGrid.map((_, i) => i);
      for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
      }
      
      const newGrid = indices.map(i => currentChallenge.grid[i]);
      setDisplayGrid(newGrid);
      
      // Update selected squares to match new positions
      setSelectedSquares(prev => {
        return prev.map(oldIdx => indices.indexOf(oldIdx)).filter(idx => idx !== -1);
      });
      
      setMessage('🔀 Grid shuffled! Selections updated.');
    }, 5000);

    return () => clearInterval(shuffleInterval);
  }, [isVerifying, displayGrid, currentChallenge.grid]);

  // Randomly uncheck the robot checkbox
  useEffect(() => {
    const uncheckInterval = setInterval(() => {
      if (robotCheckbox && Math.random() < 0.2) {
        setRobotCheckbox(false);
        setMessage('⚠️ Checkbox unchecked itself. Please re-confirm.');
      }
    }, 4000);

    return () => clearInterval(uncheckInterval);
  }, [robotCheckbox]);

  const triggerShake = useCallback(() => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  }, [shakeAnim]);

  const loadNewChallenge = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * CHALLENGES.length);
    const challenge = CHALLENGES[randomIndex];
    setCurrentChallenge(challenge);
    setDisplayGrid([...challenge.grid]);
    setSelectedSquares([]);
    setTimeLeft(15);
    setRobotCheckbox(false);
    setSliderValue(0);
    setTargetSliderValue(Math.floor(Math.random() * 80) + 10);
    
    // Random number of verification steps (1-3)
    setTotalSteps(Math.floor(Math.random() * 3) + 1);
    setVerificationStep(1);
    
    // Fade in animation
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const toggleSquare = (index: number) => {
    if (isVerifying || hiddenSquares.includes(index)) return;
    
    setSelectedSquares(prev => {
      if (prev.includes(index)) {
        return prev.filter(i => i !== index);
      } else {
        return [...prev, index];
      }
    });
  };

  const handleVerify = () => {
    if (isVerifying || selectedSquares.length === 0) return;
    
    // Check robot checkbox
    if (!robotCheckbox) {
      setMessage('⚠️ Please confirm you are not a robot first!');
      triggerShake();
      return;
    }

    // Check slider is close enough to target
    if (Math.abs(sliderValue - targetSliderValue) > 5) {
      setMessage(`⚠️ Slider must be at ${targetSliderValue}! Currently: ${sliderValue}`);
      triggerShake();
      return;
    }
    
    setIsVerifying(true);
    setMessage(LOADING_MESSAGES[Math.floor(Math.random() * LOADING_MESSAGES.length)]);

    // Fake loading delay (frustrating!)
    const delay = 2000 + Math.random() * 3000;
    
    setTimeout(() => {
      // Random fake error (15% chance)
      if (Math.random() < 0.15) {
        setShowFakeError(true);
        const errors = [
          '⚠️ Network error. Please try again.',
          '⚠️ Session expired. Reloading...',
          '⚠️ Server busy. Please wait.',
          '⚠️ Verification failed. Unknown error.',
        ];
        setMessage(errors[Math.floor(Math.random() * errors.length)]);
        setIsVerifying(false);
        setRobotCheckbox(false);
        setTimeout(() => setShowFakeError(false), 2000);
        return;
      }

      // Find where selected squares map to in original grid
      const originalSelected = selectedSquares.map(idx => {
        return currentChallenge.grid.indexOf(displayGrid[idx]);
      });

      // Check if selection is correct
      const sortedSelected = [...new Set(originalSelected)].sort((a, b) => a - b);
      const sortedTargets = [...currentChallenge.targets].sort((a, b) => a - b);
      const isCorrect = JSON.stringify(sortedSelected) === JSON.stringify(sortedTargets);

      // For ambiguous challenges, 40% chance of random failure even if correct
      const ambiguousFail = currentChallenge.ambiguous && isCorrect && Math.random() < 0.4;

      if (isCorrect && !ambiguousFail) {
        if (verificationStep < totalSteps) {
          // Need more verification steps!
          setVerificationStep(prev => prev + 1);
          setMessage(`✓ Step ${verificationStep}/${totalSteps} complete. Continue verification...`);
          setSelectedSquares([]);
          setRobotCheckbox(false);
          setSliderValue(0);
          setTargetSliderValue(Math.floor(Math.random() * 80) + 10);
          setTimeLeft(12); // Less time for subsequent steps!
        } else {
          // Success! But brightness barely increases
          const newBrightness = Math.min(1, brightness + 0.03);
          setBrightness(newBrightness);
          onBrightnessChange(newBrightness);
          setCompletedCount(prev => prev + 1);
          setMessage(SUCCESS_MESSAGES[Math.floor(Math.random() * SUCCESS_MESSAGES.length)]);
          
          // Load another challenge after short delay
          setTimeout(() => {
            loadNewChallenge();
            setMessage('Prove you are human to adjust brightness');
          }, 1500);
        }
      } else {
        // Failure! Brightness drops significantly
        const newBrightness = Math.max(0, brightness - 0.18);
        setBrightness(newBrightness);
        onBrightnessChange(newBrightness);
        setFailCount(prev => prev + 1);
        setMessage(FAIL_MESSAGES[Math.floor(Math.random() * FAIL_MESSAGES.length)]);
        triggerShake();
        
        // Clear selection and reset
        setSelectedSquares([]);
        setRobotCheckbox(false);
        setVerificationStep(1);
      }
      
      setIsVerifying(false);
    }, delay);
  };

  const getBrightnessColor = () => {
    if (brightness > 0.7) return '#4ade80';
    if (brightness > 0.4) return '#fbbf24';
    return '#ef4444';
  };

  const getTimerColor = () => {
    if (timeLeft > 10) return '#4ade80';
    if (timeLeft > 5) return '#fbbf24';
    return '#ef4444';
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🤖 Captcha Dimmer 🤖</Text>
      <Text style={styles.subtitle}>NIGHTMARE EDITION</Text>
      
      {/* Timer */}
      <View style={styles.timerContainer}>
        <Text style={[styles.timerText, { color: getTimerColor() }]}>
          ⏱️ {timeLeft}s
        </Text>
        {totalSteps > 1 && (
          <Text style={styles.stepText}>Step {verificationStep}/{totalSteps}</Text>
        )}
      </View>

      {/* Brightness bar */}
      <View style={styles.brightnessContainer}>
        <View style={styles.brightnessBar}>
          <View 
            style={[
              styles.brightnessLevel, 
              { width: `${brightness * 100}%`, backgroundColor: getBrightnessColor() }
            ]} 
          />
        </View>
        <Text style={styles.brightnessText}>{Math.round(brightness * 100)}%</Text>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <Text style={styles.statsText}>✅ Passed: {completedCount}</Text>
        <Text style={styles.statsText}>❌ Failed: {failCount}</Text>
      </View>

      {/* Captcha box */}
      <Animated.View 
        style={[
          styles.captchaBox,
          { transform: [{ translateX: shakeAnim }], opacity: fadeAnim }
        ]}
      >
        {/* Header */}
        <View style={styles.captchaHeader}>
          <Text style={styles.captchaPrompt}>{currentChallenge.prompt}</Text>
          {currentChallenge.ambiguous && (
            <Text style={styles.ambiguousHint}>⚠️ This one is VERY tricky...</Text>
          )}
        </View>

        {/* Grid - 4x4 now */}
        <View style={styles.grid}>
          {displayGrid.map((emoji, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.gridSquare,
                selectedSquares.includes(index) && styles.selectedSquare,
                hiddenSquares.includes(index) && styles.hiddenSquare,
              ]}
              onPress={() => toggleSquare(index)}
              disabled={isVerifying || hiddenSquares.includes(index)}
            >
              <Animated.Text 
                style={[
                  styles.gridEmoji,
                  { opacity: squareAnims[index] || 1 }
                ]}
              >
                {hiddenSquares.includes(index) ? '❓' : emoji}
              </Animated.Text>
              {selectedSquares.includes(index) && (
                <View style={styles.checkmark}>
                  <Text style={styles.checkmarkText}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Robot checkbox */}
        <TouchableOpacity 
          style={styles.checkboxRow}
          onPress={() => setRobotCheckbox(!robotCheckbox)}
        >
          <View style={[styles.checkbox, robotCheckbox && styles.checkboxChecked]}>
            {robotCheckbox && <Text style={styles.checkboxMark}>✓</Text>}
          </View>
          <Text style={styles.checkboxLabel}>I am not a robot</Text>
        </TouchableOpacity>

        {/* Slider verification */}
        <View style={styles.sliderContainer}>
          <Text style={styles.sliderLabel}>Slide to {targetSliderValue}:</Text>
          <View style={styles.sliderTrack}>
            <View style={[styles.sliderFill, { width: `${sliderValue}%` }]} />
            <TouchableOpacity
              style={[styles.sliderThumb, { left: `${sliderValue - 5}%` }]}
              onPress={() => {}}
            />
          </View>
          <View style={styles.sliderButtons}>
            <TouchableOpacity 
              style={styles.sliderBtn} 
              onPress={() => setSliderValue(Math.max(0, sliderValue - 5))}
            >
              <Text style={styles.sliderBtnText}>◀</Text>
            </TouchableOpacity>
            <Text style={styles.sliderValueText}>{sliderValue}</Text>
            <TouchableOpacity 
              style={styles.sliderBtn} 
              onPress={() => setSliderValue(Math.min(100, sliderValue + 5))}
            >
              <Text style={styles.sliderBtnText}>▶</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Verify button */}
        <TouchableOpacity
          style={[
            styles.verifyButton,
            isVerifying && styles.verifyingButton,
            selectedSquares.length === 0 && styles.disabledButton,
          ]}
          onPress={handleVerify}
          disabled={isVerifying || selectedSquares.length === 0}
        >
          <Text style={styles.verifyButtonText}>
            {isVerifying ? '⏳ Verifying...' : '✓ VERIFY'}
          </Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Message */}
      <Text style={[
        styles.message,
        showFakeError && styles.errorMessage,
      ]}>
        {message}
      </Text>

      {/* How it works */}
      <View style={styles.infoBox}>
        <Text style={styles.infoText}>
          ✓ Correct = +3% | ✗ Wrong = -18% | ⏰ Timeout = -20%{'\n'}
          🔀 Grid shuffles! ❓ Squares hide! ☑️ Checkbox unchecks!
        </Text>
      </View>

      {/* Exit button */}
      <TouchableOpacity style={styles.exitButton} onPress={onExit}>
        <Text style={styles.exitText}>🚪 Give Up (Like a Robot Would)</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    paddingTop: 30,
    paddingHorizontal: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
    color: '#ff4444',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    marginBottom: 8,
  },
  timerText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  stepText: {
    fontSize: 14,
    color: '#888',
  },
  brightnessContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '85%',
    marginBottom: 8,
  },
  brightnessBar: {
    flex: 1,
    height: 12,
    backgroundColor: '#333',
    borderRadius: 6,
    overflow: 'hidden',
    marginRight: 10,
  },
  brightnessLevel: {
    height: '100%',
    borderRadius: 6,
  },
  brightnessText: {
    fontSize: 13,
    color: '#fff',
    fontWeight: 'bold',
    width: 40,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 25,
    marginBottom: 10,
  },
  statsText: {
    fontSize: 11,
    color: '#888',
  },
  captchaBox: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    width: '100%',
    maxWidth: 340,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  captchaHeader: {
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingBottom: 8,
    marginBottom: 8,
  },
  captchaPrompt: {
    fontSize: 13,
    color: '#333',
    fontWeight: '600',
    textAlign: 'center',
  },
  ambiguousHint: {
    fontSize: 10,
    color: '#ff4444',
    textAlign: 'center',
    marginTop: 4,
    fontWeight: 'bold',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 4,
  },
  gridSquare: {
    width: 72,
    height: 72,
    backgroundColor: '#f5f5f5',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ddd',
  },
  selectedSquare: {
    borderColor: '#4285f4',
    backgroundColor: '#e3f2fd',
  },
  hiddenSquare: {
    backgroundColor: '#333',
  },
  gridEmoji: {
    fontSize: 32,
  },
  checkmark: {
    position: 'absolute',
    top: 3,
    right: 3,
    width: 18,
    height: 18,
    backgroundColor: '#4285f4',
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    padding: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 5,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 2,
    borderColor: '#999',
    borderRadius: 3,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#4285f4',
    borderColor: '#4285f4',
  },
  checkboxMark: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 13,
    color: '#333',
  },
  sliderContainer: {
    marginTop: 10,
    padding: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 5,
  },
  sliderLabel: {
    fontSize: 11,
    color: '#666',
    marginBottom: 5,
    textAlign: 'center',
  },
  sliderTrack: {
    height: 20,
    backgroundColor: '#ddd',
    borderRadius: 10,
    position: 'relative',
  },
  sliderFill: {
    height: '100%',
    backgroundColor: '#4285f4',
    borderRadius: 10,
  },
  sliderThumb: {
    position: 'absolute',
    top: -2,
    width: 24,
    height: 24,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#4285f4',
  },
  sliderButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 5,
    gap: 15,
  },
  sliderBtn: {
    width: 30,
    height: 30,
    backgroundColor: '#4285f4',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sliderBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  sliderValueText: {
    fontSize: 14,
    color: '#333',
    fontWeight: 'bold',
    minWidth: 30,
    textAlign: 'center',
  },
  verifyButton: {
    backgroundColor: '#4285f4',
    paddingVertical: 10,
    borderRadius: 5,
    marginTop: 10,
    alignItems: 'center',
  },
  verifyingButton: {
    backgroundColor: '#999',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  verifyButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  message: {
    fontSize: 12,
    color: '#aaa',
    marginTop: 10,
    textAlign: 'center',
    minHeight: 35,
    paddingHorizontal: 10,
  },
  errorMessage: {
    color: '#ff4444',
  },
  infoBox: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 8,
    borderRadius: 8,
    marginTop: 5,
  },
  infoText: {
    fontSize: 10,
    color: '#888',
    textAlign: 'center',
    lineHeight: 16,
  },
  exitButton: {
    marginTop: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#333',
    borderRadius: 20,
  },
  exitText: {
    color: '#fff',
    fontSize: 12,
  },
});
