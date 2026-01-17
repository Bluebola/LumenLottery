// Snake Brightness Game
// Developer: [YOUR NAME HERE]
// 
// Rules:
// - Snake length controls brightness
// - Collision causes instant dim
// - Brightness updates every movement tick
//
// Implementation hints:
// - Use interval-based movement
// - Map length logarithmically to brightness

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MinigameProps } from '../types/Minigame';

export default function SnakeGame({ onBrightnessChange, onExit }: MinigameProps) {
  // TODO: Implement Snake game
  // 
  // Example of how to change brightness:
  // onBrightnessChange(0.5); // Sets to 50% brightness
  //
  // Example of how to exit:
  // onExit();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🐍 Snake Game</Text>
      <Text style={styles.placeholder}>TODO: Implement me!</Text>
      <Text style={styles.hint}>Snake length = Brightness level</Text>
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
