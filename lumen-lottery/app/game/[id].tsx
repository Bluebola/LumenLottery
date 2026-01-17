import React, { useCallback, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, StatusBar } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { setBrightness, restoreBrightness } from '@/src/brightness/brightnessController';

// Import all minigames
import SnakeGame from '@/src/minigames/SnakeGame';
import SeesawGame from '@/src/minigames/SeesawGame';
import SlotMachineGame from '@/src/minigames/SlotMachineGame';
import FlappyBrightGame from '@/src/minigames/FlappyBrightGame';
import TetrisLuxGame from '@/src/minigames/TetrisLuxGame';
import PongSunGame from '@/src/minigames/PongSunGame';
import BallInBoxGame from '@/src/minigames/BallInBoxGame';
import PendulumGame from '@/src/minigames/PendulumGame';
import RouletteGame from '@/src/minigames/RouletteGame';
import DiceGame from '@/src/minigames/DiceGame';
import LogicGateGame from '@/src/minigames/LogicGateGame';
import MathQuizGame from '@/src/minigames/MathQuizGame';
import CaptchaGame from '@/src/minigames/CaptchaGame';
import CountdownGame from '@/src/minigames/CountdownGame';
import HoldToGlowGame from '@/src/minigames/HoldToGlowGame';
import AFKBrightnessGame from '@/src/minigames/AFKBrightnessGame';
import PeerPressureGame from '@/src/minigames/PeerPressureGame';
import InvisibleSliderGame from '@/src/minigames/InvisibleSliderGame';
import NonlinearSliderGame from '@/src/minigames/NonlinearSliderGame';
import TypingSpeedGame from '@/src/minigames/TypingSpeedGame';
import VoiceShoutGame from '@/src/minigames/VoiceShoutGame';

// Game ID to component mapping
const GAMES: Record<string, React.ComponentType<any>> = {
  snake: SnakeGame,
  flappy: FlappyBrightGame,
  tetris: TetrisLuxGame,
  pong: PongSunGame,
  seesaw: SeesawGame,
  ballinbox: BallInBoxGame,
  pendulum: PendulumGame,
  slots: SlotMachineGame,
  roulette: RouletteGame,
  dice: DiceGame,
  logic: LogicGateGame,
  math: MathQuizGame,
  captcha: CaptchaGame,
  countdown: CountdownGame,
  hold: HoldToGlowGame,
  afk: AFKBrightnessGame,
  peer: PeerPressureGame,
  invisible: InvisibleSliderGame,
  nonlinear: NonlinearSliderGame,
  typing: TypingSpeedGame,
  voice: VoiceShoutGame,
};

// Rate limiting for brightness updates
const BRIGHTNESS_UPDATE_INTERVAL = 50;

export default function GameScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const lastUpdateTime = useRef<number>(0);

  // Handle brightness changes from minigames (with rate limiting)
  const handleBrightnessChange = useCallback(async (value: number) => {
    const now = Date.now();
    if (now - lastUpdateTime.current < BRIGHTNESS_UPDATE_INTERVAL) {
      return;
    }
    lastUpdateTime.current = now;
    await setBrightness(value);
  }, []);

  // Handle exit from minigame
  const handleExit = useCallback(async () => {
    await restoreBrightness();
    router.back();
  }, [router]);

  // Get the game component
  const GameComponent = id ? GAMES[id] : null;

  if (!GameComponent) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorEmoji}>🤷</Text>
        <Text style={styles.errorText}>Game not found: {id}</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>← Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Game Content */}
      <GameComponent
        onBrightnessChange={handleBrightnessChange}
        onExit={handleExit}
      />

      {/* Floating Exit Button */}
      <TouchableOpacity style={styles.exitButton} onPress={handleExit}>
        <Text style={styles.exitButtonText}>✕</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a1a',
  },
  exitButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(231, 76, 60, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  exitButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0a0a1a',
    padding: 20,
  },
  errorEmoji: {
    fontSize: 80,
    marginBottom: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#888',
    marginBottom: 30,
  },
  backButton: {
    backgroundColor: '#ffd700',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
