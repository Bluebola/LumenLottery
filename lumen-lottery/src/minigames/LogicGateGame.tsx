// Logic Gate Brightness Game
// AND/OR/XOR switches control brightness

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MinigameProps } from '../types/Minigame';

export default function LogicGateGame({ onBrightnessChange, onExit }: MinigameProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>🔌</Text>
      <Text style={styles.title}>Logic Gate Brightness</Text>
      <Text style={styles.placeholder}>Coming Soon!</Text>
      <Text style={styles.hint}>AND / OR / XOR switches{'\n'}No explanation provided</Text>
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
