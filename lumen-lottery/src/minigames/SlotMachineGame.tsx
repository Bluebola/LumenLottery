// Slot Machine Brightness Game
// Developer: Copilot
//
// Rules:
// - Pull lever to spin
// - Random brightness outcome
// - Tiny probability of comfortable brightness (1% jackpot!)
//
// The reels spin and land on brightness symbols
// Most outcomes are terrible - either too dim or blindingly bright!

import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing } from 'react-native';
import { MinigameProps } from '../types/Minigame';

// Slot symbols with their brightness values and weights
const SYMBOLS = [
  { emoji: '🌑', brightness: 0.05, name: 'New Moon', weight: 20 },      // Very dim
  { emoji: '🌒', brightness: 0.1, name: 'Waxing Crescent', weight: 15 },
  { emoji: '🌓', brightness: 0.2, name: 'First Quarter', weight: 15 },
  { emoji: '🌔', brightness: 0.3, name: 'Waxing Gibbous', weight: 10 },
  { emoji: '🌕', brightness: 1.0, name: 'Full Moon', weight: 20 },      // Blindingly bright!
  { emoji: '☀️', brightness: 0.5, name: 'JACKPOT!', weight: 1 },        // Comfortable - 1% chance!
  { emoji: '💀', brightness: 0.0, name: 'Pitch Black', weight: 10 },    // Complete darkness
  { emoji: '🔥', brightness: 0.95, name: 'Inferno', weight: 8 },        // Way too bright
  { emoji: '⭐', brightness: 0.15, name: 'Dim Star', weight: 10 },
];

// Weighted random selection
const getRandomSymbol = () => {
  const totalWeight = SYMBOLS.reduce((sum, s) => sum + s.weight, 0);
  let random = Math.random() * totalWeight;
  for (const symbol of SYMBOLS) {
    random -= symbol.weight;
    if (random <= 0) return symbol;
  }
  return SYMBOLS[0];
};

export default function SlotMachineGame({ onBrightnessChange, onExit }: MinigameProps) {
  const [reels, setReels] = useState([SYMBOLS[0], SYMBOLS[0], SYMBOLS[0]]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [spinsCount, setSpinsCount] = useState(0);
  const [jackpotHit, setJackpotHit] = useState(false);

  // Animation values for each reel
  const spinAnims = [
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
  ];

  // Lever animation
  const leverAnim = useRef(new Animated.Value(0)).current;

  const pullLever = () => {
    if (isSpinning) return;

    setIsSpinning(true);
    setResult(null);
    setJackpotHit(false);
    setSpinsCount(prev => prev + 1);

    // Animate lever pull
    Animated.sequence([
      Animated.timing(leverAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(leverAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Generate final results
    const finalReels = [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()];

    // Spin each reel with staggered stop times
    const spinDurations = [1500, 2000, 2500];

    spinAnims.forEach((anim, index) => {
      // Reset animation
      anim.setValue(0);

      // Spin animation
      Animated.timing(anim, {
        toValue: 10, // Number of rotations
        duration: spinDurations[index],
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();

      // Update reel display during spin
      const spinInterval = setInterval(() => {
        setReels(prev => {
          const newReels = [...prev];
          newReels[index] = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
          return newReels;
        });
      }, 100);

      // Stop spinning and show final result
      setTimeout(() => {
        clearInterval(spinInterval);
        setReels(prev => {
          const newReels = [...prev];
          newReels[index] = finalReels[index];
          return newReels;
        });

        // When last reel stops
        if (index === 2) {
          setTimeout(() => {
            setIsSpinning(false);
            calculateResult(finalReels);
          }, 100);
        }
      }, spinDurations[index]);
    });
  };

  const calculateResult = (finalReels: typeof SYMBOLS) => {
    // Check for jackpot (all ☀️)
    const allSun = finalReels.every(r => r.emoji === '☀️');
    if (allSun) {
      setJackpotHit(true);
      setResult('🎉 JACKPOT!!! Perfect brightness! 🎉');
      onBrightnessChange(0.5);
      return;
    }

    // Check for three of a kind
    if (finalReels[0].emoji === finalReels[1].emoji && finalReels[1].emoji === finalReels[2].emoji) {
      const symbol = finalReels[0];
      setResult(`Triple ${symbol.emoji}! ${symbol.name}`);
      onBrightnessChange(symbol.brightness);
      return;
    }

    // Calculate average brightness (usually terrible)
    const avgBrightness = finalReels.reduce((sum, r) => sum + r.brightness, 0) / 3;
    
    // Add some chaos - occasionally invert the result
    const chaosRoll = Math.random();
    let finalBrightness = avgBrightness;
    let chaosText = '';
    
    if (chaosRoll < 0.1) {
      finalBrightness = 1 - avgBrightness; // Invert!
      chaosText = ' (REVERSED!)';
    } else if (chaosRoll < 0.15) {
      finalBrightness = Math.random(); // Complete chaos
      chaosText = ' (CHAOS!)';
    }

    // Determine result message
    if (finalBrightness < 0.2) {
      setResult(`😵 Too dark!${chaosText} Good luck seeing...`);
    } else if (finalBrightness > 0.8) {
      setResult(`😎 Blinding!${chaosText} RIP your eyes!`);
    } else if (finalBrightness >= 0.4 && finalBrightness <= 0.6) {
      setResult(`😮 Almost comfortable!${chaosText} Spin again to lose it!`);
    } else {
      setResult(`Meh.${chaosText} Could be worse...`);
    }

    onBrightnessChange(finalBrightness);
  };

  const leverRotation = leverAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg'],
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <Text style={styles.title}>🎰 LUMEN SLOTS 🎰</Text>
      <Text style={styles.subtitle}>Gamble Your Eyesight!</Text>

      {/* Slot Machine Body */}
      <View style={styles.machineBody}>
        {/* Reels Display */}
        <View style={styles.reelsContainer}>
          {reels.map((reel, index) => (
            <View key={index} style={styles.reelWindow}>
              <Text style={[styles.reelSymbol, isSpinning && styles.spinning]}>
                {reel.emoji}
              </Text>
            </View>
          ))}
        </View>

        {/* Result Display */}
        <View style={styles.resultContainer}>
          {result && (
            <Text style={[styles.resultText, jackpotHit && styles.jackpotText]}>
              {result}
            </Text>
          )}
          {!result && !isSpinning && (
            <Text style={styles.instructionText}>Pull the lever to spin!</Text>
          )}
          {isSpinning && (
            <Text style={styles.spinningText}>🎲 Spinning... 🎲</Text>
          )}
        </View>
      </View>

      {/* Lever */}
      <TouchableOpacity
        style={styles.leverContainer}
        onPress={pullLever}
        disabled={isSpinning}
        activeOpacity={0.7}
      >
        <View style={styles.leverBase} />
        <Animated.View
          style={[
            styles.leverArm,
            { transform: [{ rotate: leverRotation }] },
          ]}
        >
          <View style={styles.leverHandle} />
        </Animated.View>
        <Text style={styles.leverText}>
          {isSpinning ? '⏳' : '🎰 PULL!'}
        </Text>
      </TouchableOpacity>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <Text style={styles.statsText}>Spins: {spinsCount}</Text>
        <Text style={styles.oddsText}>☀️ Jackpot odds: ~1%</Text>
      </View>

      {/* Symbol Legend */}
      <View style={styles.legendContainer}>
        <Text style={styles.legendTitle}>Symbol Guide:</Text>
        <View style={styles.legendGrid}>
          <Text style={styles.legendItem}>🌑 5% | 🌕 100%</Text>
          <Text style={styles.legendItem}>💀 0% | 🔥 95%</Text>
          <Text style={styles.legendItem}>☀️ 50% (JACKPOT!)</Text>
        </View>
      </View>

      {/* Exit Button */}
      <TouchableOpacity style={styles.exitButton} onPress={onExit}>
        <Text style={styles.exitText}>🚪 Leave Casino</Text>
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
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffd700',
    textShadowColor: '#ff6b6b',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#ff6b6b',
    marginBottom: 20,
    fontStyle: 'italic',
  },
  machineBody: {
    backgroundColor: '#2d2d5a',
    borderRadius: 20,
    padding: 20,
    borderWidth: 4,
    borderColor: '#ffd700',
    shadowColor: '#ffd700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
  },
  reelsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  reelWindow: {
    width: 80,
    height: 100,
    backgroundColor: '#fff',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#333',
    overflow: 'hidden',
  },
  reelSymbol: {
    fontSize: 50,
  },
  spinning: {
    opacity: 0.7,
  },
  resultContainer: {
    marginTop: 15,
    minHeight: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultText: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  jackpotText: {
    color: '#ffd700',
    fontSize: 20,
    textShadowColor: '#ff6b6b',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5,
  },
  instructionText: {
    fontSize: 14,
    color: '#888',
    fontStyle: 'italic',
  },
  spinningText: {
    fontSize: 16,
    color: '#ffd700',
    fontWeight: 'bold',
  },
  leverContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  leverBase: {
    width: 40,
    height: 20,
    backgroundColor: '#444',
    borderRadius: 5,
  },
  leverArm: {
    width: 8,
    height: 60,
    backgroundColor: '#888',
    borderRadius: 4,
    marginTop: -10,
    transformOrigin: 'bottom',
  },
  leverHandle: {
    width: 30,
    height: 30,
    backgroundColor: '#ff4444',
    borderRadius: 15,
    position: 'absolute',
    top: -15,
    left: -11,
    borderWidth: 3,
    borderColor: '#aa0000',
  },
  leverText: {
    marginTop: 10,
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  statsContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  statsText: {
    fontSize: 14,
    color: '#aaa',
  },
  oddsText: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  legendContainer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
    alignItems: 'center',
  },
  legendTitle: {
    fontSize: 12,
    color: '#888',
    marginBottom: 5,
  },
  legendGrid: {
    alignItems: 'center',
  },
  legendItem: {
    fontSize: 11,
    color: '#aaa',
  },
  exitButton: {
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 30,
    backgroundColor: '#444',
    borderRadius: 25,
  },
  exitText: {
    color: '#fff',
    fontSize: 16,
  },
});
