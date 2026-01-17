// Dice of Doom Game
// Roll dice to set brightness in chunks

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MinigameProps } from '../types/Minigame';

export default function DiceGame({ onBrightnessChange, onExit }: MinigameProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>🎲</Text>
      <Text style={styles.title}>Dice of Doom</Text>
      <Text style={styles.placeholder}>Coming Soon!</Text>
      <Text style={styles.hint}>Roll dice for brightness{'\n'}Must roll exact sum for target</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1a1a2e' },
  emoji: { fontSize: 80, marginBottom: 20 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#fff', marginBottom: 20 },
  placeholder: { fontSize: 18, color: '#ffd700', marginBottom: 10 },
  hint: { fontSize: 14, color: '#888', textAlign: 'center', lineHeight: 22 },
});
