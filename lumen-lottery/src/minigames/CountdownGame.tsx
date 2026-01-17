// Countdown to Light Game
// Brightness increases slowly, touching anything resets

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MinigameProps } from '../types/Minigame';

export default function CountdownGame({ onBrightnessChange, onExit }: MinigameProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>⏳</Text>
      <Text style={styles.title}>Countdown to Light</Text>
      <Text style={styles.placeholder}>Coming Soon!</Text>
      <Text style={styles.hint}>Brightness increases over 30 sec{'\n'}Touch anything = RESET</Text>
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
