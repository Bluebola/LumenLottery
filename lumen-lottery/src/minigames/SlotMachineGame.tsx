// Slot Machine Brightness Game
// Developer: [YOUR NAME HERE]
//
// Rules:
// - Pull lever to spin
// - Random brightness outcome
// - Tiny probability of comfortable brightness (make it frustrating!)
//
// Implementation hints:
// - Animate reels spinning
// - Delay brightness update until reels stop

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MinigameProps } from '../types/Minigame';

export default function SlotMachineGame({ onBrightnessChange, onExit }: MinigameProps) {
  // TODO: Implement Slot Machine game
  //
  // Example of how to change brightness:
  // const randomBrightness = Math.random(); // 0 to 1
  // onBrightnessChange(randomBrightness);
  //
  // Example of how to exit:
  // onExit();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎰 Slot Machine</Text>
      <Text style={styles.placeholder}>TODO: Implement me!</Text>
      <Text style={styles.hint}>Gamble your eyesight! (1% chance of comfort)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  placeholder: {
    fontSize: 18,
    color: '#888',
    marginBottom: 10,
  },
  hint: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
});
