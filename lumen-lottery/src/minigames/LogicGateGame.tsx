// Logic Gate Brightness Game
// Solve logic gate puzzles to increase brightness

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { MinigameProps } from '../types/Minigame';

interface Gate {
  id: string;
  type: 'AND' | 'OR' | 'XOR' | 'NAND' | 'NOR' | 'XNOR';
  input1: boolean;
  input2: boolean;
  isCorrect: boolean;
}

type Difficulty = 'Easy' | 'Medium' | 'Hard';

export default function LogicGateGame({ onBrightnessChange, onExit }: MinigameProps) {
  const [difficulty, setDifficulty] = useState<Difficulty>('Easy');
  const [gates, setGates] = useState<Gate[]>([
    { id: '1', type: 'AND', input1: false, input2: false, isCorrect: false },
    { id: '2', type: 'OR', input1: false, input2: false, isCorrect: false },
    { id: '3', type: 'XOR', input1: false, input2: false, isCorrect: false },
  ]);

  const [round, setRound] = useState(1);
  const [timeLeft, setTimeLeft] = useState(60);
  const [mistakes, setMistakes] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);

  const gateCount = difficulty === 'Easy' ? 3 : difficulty === 'Medium' ? 4 : 5;
  const timeLimit = difficulty === 'Easy' ? 999 : difficulty === 'Medium' ? 90 : 60;

  // Timer that decreases every round
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const evaluateGate = (gate: Gate): boolean => {
    if (gate.type === 'AND') {
      return gate.input1 && gate.input2;
    } else if (gate.type === 'OR') {
      return gate.input1 || gate.input2;
    } else if (gate.type === 'XOR') {
      return gate.input1 !== gate.input2;
    } else if (gate.type === 'NAND') {
      return !(gate.input1 && gate.input2);
    } else if (gate.type === 'NOR') {
      return !(gate.input1 || gate.input2);
    } else if (gate.type === 'XNOR') {
      return gate.input1 === gate.input2;
    }
    return false;
  };

  const toggleInput = (gateId: string, inputNum: 1 | 2) => {
    setGates((prevGates) =>
      prevGates.map((gate) => {
        if (gate.id === gateId) {
          const newGate = { ...gate };
          if (inputNum === 1) {
            newGate.input1 = !newGate.input1;
          } else {
            newGate.input2 = !newGate.input2;
          }
          newGate.isCorrect = evaluateGate(newGate);
          return newGate;
        }
        return gate;
      })
    );
  };

  const correctCount = gates.filter((g) => g.isCorrect).length;
  const baseBrightness = 0.2 + (correctCount / gates.length) * 0.8;
  // Reduce brightness based on mistakes and time left
  const mistakePenalty = Math.max(0, (mistakes * 0.1));
  const timePenalty = difficulty !== 'Easy' && timeLeft <= 0 ? 0.5 : 0;
  const brightness = Math.max(0.02, baseBrightness - mistakePenalty - timePenalty);

  useEffect(() => {
    onBrightnessChange(brightness);
  }, [correctCount, mistakes, timeLeft, onBrightnessChange, difficulty]);

  const handleNextRound = () => {
    const newGates: Gate[] = Array.from({ length: gateCount }, (_, index) => {
      const allGates: Array<'AND' | 'OR' | 'XOR' | 'NAND' | 'NOR' | 'XNOR'> = 
        difficulty === 'Easy' 
          ? ['AND', 'OR', 'XOR']
          : difficulty === 'Medium'
          ? ['AND', 'OR', 'XOR', 'NAND', 'NOR']
          : ['AND', 'OR', 'XOR', 'NAND', 'NOR', 'XNOR'];
      
      return {
        id: String(index + 1),
        type: allGates[Math.floor(Math.random() * allGates.length)],
        input1: false,
        input2: false,
        isCorrect: false,
      };
    });
    
    setGates(newGates);
    setRound(round + 1);
    setTimeLeft(timeLimit);
    
    // Update streak
    if (correctCount === gates.length && timeLeft > 0) {
      setCurrentStreak(currentStreak + 1);
      setBestStreak(Math.max(bestStreak, currentStreak + 1));
    } else {
      setCurrentStreak(0);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>Logic Gate Lux</Text>
        <Text style={styles.brightness}>{Math.round(brightness * 100)}%</Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Round</Text>
          <Text style={styles.statValue}>{round}</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Streak</Text>
          <Text style={[styles.statValue, currentStreak > 0 && styles.streakActive]}>{currentStreak}🔥</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Mistakes</Text>
          <Text style={[styles.statValue, mistakes > 0 && styles.mistakesActive]}>{mistakes}</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Best</Text>
          <Text style={styles.statValue}>{bestStreak}</Text>
        </View>
      </View>

      <View style={styles.difficultyRow}>
        {(['Easy', 'Medium', 'Hard'] as Difficulty[]).map((diff) => (
          <TouchableOpacity
            key={diff}
            onPress={() => setDifficulty(diff)}
            style={[styles.difficultyChip, difficulty === diff && styles.difficultyChipActive]}
          >
            <Text style={[styles.difficultyText, difficulty === diff && styles.difficultyTextActive]}>
              {diff}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {difficulty !== 'Easy' && (
        <View style={[styles.timerBox, timeLeft <= 10 && styles.timerBoxWarning]}>
          <Text style={styles.timerLabel}>Time</Text>
          <Text style={[styles.timerValue, timeLeft <= 10 && styles.timerValueWarning]}>
            {timeLeft}s
          </Text>
        </View>
      )}

      <View style={styles.roundInfo}>
        <Text style={styles.roundText}>Round {round}</Text>
        <Text style={styles.scoreText}>
          {correctCount}/{gates.length} correct
        </Text>
      </View>

      <View style={styles.gatesContainer}>
        {gates.map((gate) => (
          <View
            key={gate.id}
            style={[styles.gateBox, gate.isCorrect && styles.gateBoxCorrect]}
          >
            <Text style={styles.gateType}>{gate.type}</Text>

            <View style={styles.inputRow}>
              <TouchableOpacity
                style={[
                  styles.inputButton,
                  gate.input1 && styles.inputButtonActive,
                ]}
                onPress={() => toggleInput(gate.id, 1)}
              >
                <Text style={styles.inputText}>{gate.input1 ? '1' : '0'}</Text>
              </TouchableOpacity>

              <Text style={styles.gateLabel}>{gate.type}</Text>

              <TouchableOpacity
                style={[
                  styles.inputButton,
                  gate.input2 && styles.inputButtonActive,
                ]}
                onPress={() => toggleInput(gate.id, 2)}
              >
                <Text style={styles.inputText}>{gate.input2 ? '1' : '0'}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.outputRow}>
              <Text style={styles.outputLabel}>Output:</Text>
              <View style={[styles.outputButton, gate.isCorrect && styles.outputButtonCorrect]}>
                <Text style={styles.outputText}>{evaluateGate(gate) ? '1' : '0'}</Text>
              </View>
            </View>

            {gate.isCorrect && <Text style={styles.checkmark}>✓</Text>}
          </View>
        ))}
      </View>

      {correctCount === gates.length && (
        <TouchableOpacity style={styles.nextButton} onPress={handleNextRound}>
          <Text style={styles.nextButtonText}>Next Round →</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  contentContainer: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ffd700',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  brightness: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffd700',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 8,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#0d1b2e',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1f2b4a',
  },
  statLabel: {
    color: '#7f9cc4',
    fontSize: 10,
    marginBottom: 3,
  },
  statValue: {
    color: '#ffd700',
    fontSize: 14,
    fontWeight: 'bold',
  },
  streakActive: {
    color: '#ff6b6b',
  },
  mistakesActive: {
    color: '#ff7b7b',
  },
  difficultyRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 12,
    gap: 8,
  },
  difficultyChip: {
    flex: 1,
    paddingVertical: 8,
    backgroundColor: '#0d1b2e',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1f2b4a',
    alignItems: 'center',
  },
  difficultyChipActive: {
    backgroundColor: '#ffd700',
    borderColor: '#ffd700',
  },
  difficultyText: {
    color: '#7f9cc4',
    fontWeight: 'bold',
    fontSize: 12,
  },
  difficultyTextActive: {
    color: '#0d1b2e',
  },
  timerBox: {
    backgroundColor: '#0d1b2e',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#ffd700',
    alignItems: 'center',
  },
  timerBoxWarning: {
    borderColor: '#ff7b7b',
    backgroundColor: '#2a1818',
  },
  timerLabel: {
    color: '#7f9cc4',
    fontSize: 11,
    marginBottom: 4,
  },
  timerValue: {
    color: '#ffd700',
    fontSize: 24,
    fontWeight: 'bold',
  },
  timerValueWarning: {
    color: '#ff7b7b',
  },
  roundInfo: {
    alignItems: 'center',
    marginBottom: 20,
  },
  roundText: {
    fontSize: 18,
    color: '#aaa',
    marginBottom: 5,
  },
  scoreText: {
    fontSize: 16,
    color: '#ffd700',
    fontWeight: 'bold',
  },
  gatesContainer: {
    gap: 15,
    marginBottom: 20,
  },
  gateBox: {
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 15,
    borderWidth: 2,
    borderColor: '#444',
  },
  gateBoxCorrect: {
    borderColor: '#90EE90',
    backgroundColor: '#1a2a1a',
  },
  gateType: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffd700',
    marginBottom: 10,
    textAlign: 'center',
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 10,
  },
  inputButton: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: '#0f3460',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#555',
  },
  inputButtonActive: {
    backgroundColor: '#00d4ff',
    borderColor: '#00d4ff',
  },
  inputText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  gateLabel: {
    fontSize: 14,
    color: '#888',
    marginHorizontal: 10,
  },
  outputRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  outputLabel: {
    fontSize: 14,
    color: '#aaa',
  },
  outputButton: {
    width: 45,
    height: 45,
    borderRadius: 8,
    backgroundColor: '#0f3460',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#555',
  },
  outputButtonCorrect: {
    backgroundColor: '#90EE90',
    borderColor: '#90EE90',
  },
  outputText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  checkmark: {
    position: 'absolute',
    top: 10,
    right: 10,
    fontSize: 24,
    color: '#90EE90',
  },
  nextButton: {
    backgroundColor: '#ffd700',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a2e',
  },
});
