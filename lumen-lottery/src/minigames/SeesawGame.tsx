// Seesaw Physics Game
// Developer: [YOUR NAME HERE]
//
// Rules:
// - Tilt angle controls brightness
// - Add inertia and jitter
// - Brightness should NEVER stabilize (that's the joke!)
//
// Implementation hints:
// - Use gesture handlers or accelerometer
// - Normalize angle to brightness (0-1)

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MinigameProps } from '../types/Minigame';

export default function SeesawGame({ onBrightnessChange, onExit }: MinigameProps) {
  // TODO: Implement Seesaw game
  //
  // Example of how to change brightness:
  // onBrightnessChange(0.7); // Sets to 70% brightness
  //
  // Example of how to exit:
  // onExit();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>⚖️ Seesaw Game</Text>
      <Text style={styles.placeholder}>TODO: Implement me!</Text>
      <Text style={styles.hint}>Tilt angle = Brightness (but it never stays still!)</Text>
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
