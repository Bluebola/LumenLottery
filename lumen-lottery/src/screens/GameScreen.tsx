// Game Screen - Central Brightness Dispatcher
// This screen hosts minigames and handles brightness updates

import React, { useCallback, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { setBrightness, restoreBrightness } from '../brightness/brightnessController';

// Import minigames
import SnakeGame from '../minigames/SnakeGame';
import SeesawGame from '../minigames/SeesawGame';
import SlotMachineGame from '../minigames/SlotMachineGame';

interface GameScreenProps {
  // TODO: Get from navigation params
  gameId?: string;
}

// Rate limiting: Don't update brightness more than every 50ms
const BRIGHTNESS_UPDATE_INTERVAL = 50;

export default function GameScreen({ gameId = 'snake' }: GameScreenProps) {
  const lastUpdateTime = useRef<number>(0);

  // Handle brightness changes from minigames (with rate limiting)
  const handleBrightnessChange = useCallback(async (value: number) => {
    const now = Date.now();
    if (now - lastUpdateTime.current < BRIGHTNESS_UPDATE_INTERVAL) {
      return; // Skip this update (rate limiting)
    }
    lastUpdateTime.current = now;
    
    await setBrightness(value);
  }, []);

  // Handle exit from minigame
  const handleExit = useCallback(async () => {
    await restoreBrightness();
    // TODO: Navigate back to home
    console.log('Exit game, restore brightness');
  }, []);

  // Render the appropriate minigame
  const renderMinigame = () => {
    const props = {
      onBrightnessChange: handleBrightnessChange,
      onExit: handleExit,
    };

    switch (gameId) {
      case 'snake':
        return <SnakeGame {...props} />;
      case 'seesaw':
        return <SeesawGame {...props} />;
      case 'slots':
        return <SlotMachineGame {...props} />;
      default:
        return <SnakeGame {...props} />;
    }
  };

  return (
    <View style={styles.container}>
      {renderMinigame()}
      
      {/* Emergency exit button - always visible */}
      <TouchableOpacity style={styles.exitButton} onPress={handleExit}>
        <Text style={styles.exitButtonText}>🚪 EXIT</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f23',
  },
  exitButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: 'rgba(231, 76, 60, 0.9)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  exitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
