// Dice of Doom Game
// Guess if sum of two dice will be <=7 or >=7, show a 3D animation of the dice being rolled and thrown

import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing } from 'react-native';
import { MinigameProps } from '../types/Minigame';

// Component to render a 3D dice with isometric view
function Dice3D({ value, size = 120 }: { value: number | null; size?: number }) {
  const pipSize = size / 10;
  const faceSize = size * 0.85;
  
  const pips = {
    1: [[0.5, 0.5]],
    2: [[0.25, 0.25], [0.75, 0.75]],
    3: [[0.25, 0.25], [0.5, 0.5], [0.75, 0.75]],
    4: [[0.25, 0.25], [0.75, 0.25], [0.25, 0.75], [0.75, 0.75]],
    5: [[0.25, 0.25], [0.75, 0.25], [0.5, 0.5], [0.25, 0.75], [0.75, 0.75]],
    6: [[0.25, 0.25], [0.25, 0.5], [0.25, 0.75], [0.75, 0.25], [0.75, 0.5], [0.75, 0.75]],
  } as Record<number, number[][]>;

  const renderDiceFace = (faceValue: number) => {
    const facePips = pips[faceValue] || [];
    return (
      <View
        key={`face-${faceValue}`}
        style={[
          styles.isometricFace,
          {
            width: faceSize,
            height: faceSize,
            backgroundColor: '#ffd54f',
          },
        ]}
      >
        {facePips.map((pip, idx) => (
          <View
            key={idx}
            style={[
              styles.pip,
              {
                width: pipSize,
                height: pipSize,
                left: `${pip[0] * 100}%`,
                top: `${pip[1] * 100}%`,
                backgroundColor: '#0f0f23',
              },
            ]}
          />
        ))}
      </View>
    );
  };

  return (
    <View style={[styles.dice3DContainer, { width: size, height: size }]}>
      {/* Front face (main) */}
      <View
        style={[
          styles.diceFrontFace,
          { width: faceSize, height: faceSize },
        ]}
      >
        {renderDiceFace(value || 1)}
      </View>
      
      {/* Top edge (isometric right) */}
      <View
        style={[
          styles.diceTopEdge,
          {
            width: faceSize * 0.4,
            height: faceSize * 0.2,
            borderBottomColor: '#f9c947',
            borderBottomWidth: 2,
            borderRightColor: '#ffd54f',
            borderRightWidth: 1,
          },
        ]}
      />
      
      {/* Right edge (isometric side) */}
      <View
        style={[
          styles.diceRightEdge,
          {
            width: faceSize * 0.25,
            height: faceSize,
            backgroundColor: '#e8c23a',
          },
        ]}
      />
    </View>
  );
}

type Guess = 'low' | 'high' | null;

export default function DiceGame({ onBrightnessChange, onExit }: MinigameProps) {
  const [guess, setGuess] = useState<Guess>(null);
  const [result1, setResult1] = useState<number | null>(null);
  const [result2, setResult2] = useState<number | null>(null);
  const [animatingFace1, setAnimatingFace1] = useState<number | null>(null);
  const [animatingFace2, setAnimatingFace2] = useState<number | null>(null);
  const [brightness, setBrightness] = useState(0.5);
  const [message, setMessage] = useState('');
  const [isRolling, setIsRolling] = useState(false);
  
  const vibrate1 = useRef(new Animated.Value(0)).current;
  const vibrate2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    onBrightnessChange(brightness);
  }, [brightness, onBrightnessChange]);

  const rollDice = () => {
    if (!guess || isRolling) return;

    setIsRolling(true);
    setAnimatingFace1(null);
    setAnimatingFace2(null);

    // Reset vibration
    vibrate1.setValue(0);
    vibrate2.setValue(0);

    // Vibrate animation for both dice
    const createVibration = () => {
      return Animated.loop(
        Animated.sequence([
          Animated.timing(vibrate1, {
            toValue: 1,
            duration: 50,
            useNativeDriver: true,
          }),
          Animated.timing(vibrate1, {
            toValue: -1,
            duration: 50,
            useNativeDriver: true,
          }),
          Animated.timing(vibrate1, {
            toValue: 0,
            duration: 50,
            useNativeDriver: true,
          }),
        ])
      );
    };

    const vibrationAnim1 = createVibration();
    vibrationAnim1.start();

    // Flash faces rapidly
    let face1 = 1;
    let face2 = 1;
    let flashCount = 0;
    const maxFlashes = 40; // Flash for about 1 second (40 * 25ms)

    const flashInterval = setInterval(() => {
      face1 = (face1 % 6) + 1;
      face2 = (face2 % 6) + 1;
      setAnimatingFace1(face1);
      setAnimatingFace2(face2);
      flashCount++;

      if (flashCount >= maxFlashes) {
        clearInterval(flashInterval);
        vibrationAnim1.stop();
        vibrate1.setValue(0);
        vibrate2.setValue(0);

        // Generate and show final results
        const dice1 = Math.floor(Math.random() * 6) + 1;
        const dice2 = Math.floor(Math.random() * 6) + 1;
        const sum = dice1 + dice2;

        setResult1(dice1);
        setResult2(dice2);
        setAnimatingFace1(null);
        setAnimatingFace2(null);

        // Check if guess was correct
        const isCorrect =
          (guess === 'low' && sum <= 7) ||
          (guess === 'high' && sum >= 7);

        if (isCorrect) {
          setBrightness(1);
          setMessage(`🎉 Correct! Sum ${sum} is ${guess === 'low' ? '≤7' : '≥7'}!`);
        } else {
          setBrightness(0.05);
          setMessage(`💥 Wrong! Sum ${sum} is ${sum <= 7 ? '≤7' : '≥7'}`);
        }

        setIsRolling(false);

        // Stay on game page - don't auto-exit
      }
    }, 25);
  }

  const canRoll = guess !== null && result1 === null && !isRolling;

  const vibrateX = vibrate1.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: [-5, 0, 5],
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onExit} style={styles.exitButton}>
          <Text style={styles.exitText}>Exit</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Dice of Doom</Text>
        <Text style={styles.brightness}>{Math.round(brightness * 100)}%</Text>
      </View>

      <View style={styles.topCard}>
        <Text style={styles.subtitle}>Guess the sum of two dice!</Text>

        <Text style={styles.instruction}>Will the sum be low or high?</Text>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.guessButton, guess === 'low' && styles.guessButtonActive]}
            onPress={() => setGuess('low')}
            disabled={result1 !== null}
          >
            <Text style={styles.guessButtonEmoji}>📉</Text>
            <Text style={styles.guessButtonText}>Low (≤7)</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.guessButton, guess === 'high' && styles.guessButtonActive]}
            onPress={() => setGuess('high')}
            disabled={result1 !== null}
          >
            <Text style={styles.guessButtonEmoji}>📈</Text>
            <Text style={styles.guessButtonText}>High (≥7)</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.rollButton, !canRoll && styles.rollButtonDisabled]}
          onPress={rollDice}
          disabled={!canRoll}
        >
          <Text style={styles.rollButtonText}>
            {isRolling ? 'Rolling...' : result1 === null && guess ? 'Roll Dice' : 'Select first'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.bottomContainer}>
        <View style={styles.diceResultsContainer}>
          <Animated.View
            style={[
              styles.largeDiceContainer,
              { 
                transform: [
                  { translateX: vibrateX },
                ] as any,
              },
            ]}
          >
            {animatingFace1 ? (
              <Dice3D value={animatingFace1} size={120} />
            ) : result1 ? (
              <Dice3D value={result1} size={120} />
            ) : (
              <Text style={styles.largeDiceText}>🎲</Text>
            )}
          </Animated.View>

          <Text style={styles.plusText}>+</Text>

          <Animated.View
            style={[
              styles.largeDiceContainer,
              { 
                transform: [
                  { translateX: vibrateX },
                ] as any,
              },
            ]}
          >
            {animatingFace2 ? (
              <Dice3D value={animatingFace2} size={120} />
            ) : result2 ? (
              <Dice3D value={result2} size={120} />
            ) : (
              <Text style={styles.largeDiceText}>🎲</Text>
            )}
          </Animated.View>
        </View>

        {result1 !== null && result2 !== null && (
          <>
            <View style={styles.sumResultContainer}>
              <Text style={styles.equalsText}>=</Text>
              <View style={styles.sumContainer}>
                <Text style={styles.sumText}>{result1 + result2}</Text>
              </View>
            </View>

            <Text style={styles.resultText}>{message}</Text>

            <View style={styles.detailsRow}>
              <Text style={styles.detailsLabel}>You guessed:</Text>
              <Text style={styles.detailsValue}>{guess === 'low' ? 'Low (≤7)' : 'High (≥7)'}</Text>
            </View>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f23',
    paddingHorizontal: 16,
    paddingTop: 48,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  exitButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#1f2b4a',
    borderRadius: 8,
  },
  exitText: {
    color: '#e74c3c',
    fontWeight: 'bold',
    fontSize: 14,
  },
  title: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  brightness: {
    color: '#ffd54f',
    fontWeight: 'bold',
  },
  topCard: {
    backgroundColor: '#16213e',
    borderRadius: 14,
    padding: 20,
    borderWidth: 1,
    borderColor: '#23345f',
    marginBottom: 16,
  },
  bottomContainer: {
    flex: 1,
    backgroundColor: '#16213e',
    borderRadius: 14,
    padding: 20,
    borderWidth: 1,
    borderColor: '#23345f',
    justifyContent: 'center',
    alignItems: 'center',
  },
  subtitle: {
    color: '#b7c8e8',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: 'bold',
  },
  instruction: {
    color: '#7f9cc4',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 12,
  },
  guessButton: {
    flex: 1,
    backgroundColor: '#121a33',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#1f2b4a',
  },
  guessButtonActive: {
    backgroundColor: '#1a5c3a',
    borderColor: '#7bed8d',
  },
  guessButtonEmoji: {
    fontSize: 28,
    marginBottom: 8,
  },
  guessButtonText: {
    color: '#b7c8e8',
    fontWeight: 'bold',
  },
  rollButton: {
    backgroundColor: '#ffd54f',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  rollButtonDisabled: {
    backgroundColor: '#7f9cc4',
    opacity: 0.6,
  },
  rollButtonText: {
    color: '#0f0f23',
    fontWeight: 'bold',
    fontSize: 16,
  },
  diceResultsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
    marginBottom: 32,
  },
  sumResultContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 24,
  },
  diceContainer: {
    width: 70,
    height: 70,
    backgroundColor: '#ffd54f',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  largeDiceContainer: {
    width: 120,
    height: 120,
    backgroundColor: '#ffd54f',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  diceText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#0f0f23',
  },
  largeDiceText: {
    fontSize: 80,
    fontWeight: 'bold',
    color: '#0f0f23',
  },
  diceFaceContainer: {
    backgroundColor: '#ffd54f',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dice3DContainer: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  isometricFace: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#1a1a1a',
    borderRadius: 8,
    position: 'absolute',
  },
  diceFrontFace: {
    position: 'absolute',
    zIndex: 3,
  },
  diceTopEdge: {
    position: 'absolute',
    top: -12,
    right: 0,
    zIndex: 2,
    transform: [{ skewY: '-25deg' }],
  },
  diceRightEdge: {
    position: 'absolute',
    top: 0,
    right: -30,
    zIndex: 1,
    transform: [{ skewY: '25deg' }],
    borderLeftColor: '#d4a935',
    borderLeftWidth: 1,
  },
  pip: {
    borderRadius: 50,
    position: 'absolute',
  },
  plusText: {
    color: '#b7c8e8',
    fontSize: 36,
    fontWeight: 'bold',
  },
  equalsText: {
    color: '#b7c8e8',
    fontSize: 36,
    fontWeight: 'bold',
  },
  sumContainer: {
    width: 100,
    height: 100,
    backgroundColor: '#7bed8d',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sumText: {
    fontSize: 60,
    fontWeight: 'bold',
    color: '#0f0f23',
  },
  resultText: {
    color: '#7bed8d',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#1f2b4a',
  },
  detailsLabel: {
    color: '#7f9cc4',
    fontSize: 14,
  },
  detailsValue: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
