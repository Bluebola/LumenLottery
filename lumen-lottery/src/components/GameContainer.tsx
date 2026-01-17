// Game Container Component
// Wraps minigames with common UI elements (exit button, brightness indicator, etc.)

import React, { ReactNode } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';

interface GameContainerProps {
  children: ReactNode;
  title: string;
  onExit: () => void;
  currentBrightness?: number;
}

export default function GameContainer({ 
  children, 
  title, 
  onExit, 
  currentBrightness 
}: GameContainerProps) {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.exitButton} onPress={onExit}>
          <Text style={styles.exitButtonText}>← Exit</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{title}</Text>
        {currentBrightness !== undefined && (
          <Text style={styles.brightnessIndicator}>
            💡 {Math.round(currentBrightness * 100)}%
          </Text>
        )}
      </View>

      {/* Game Content */}
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f23',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: '#1a1a2e',
  },
  exitButton: {
    padding: 8,
  },
  exitButtonText: {
    color: '#e74c3c',
    fontSize: 16,
    fontWeight: 'bold',
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  brightnessIndicator: {
    color: '#ffd700',
    fontSize: 14,
  },
  content: {
    flex: 1,
  },
});
