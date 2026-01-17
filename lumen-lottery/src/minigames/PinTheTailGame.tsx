// Pin the Picture Game
// Guess where the hidden picture is!
// Distance from picture = brightness

import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  Dimensions,
  Animated,
  ScrollView,
} from 'react-native';
import { MinigameProps } from '../types/Minigame';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Game area dimensions
const GAME_AREA_WIDTH = SCREEN_WIDTH - 40;
const GAME_AREA_HEIGHT = SCREEN_HEIGHT * 0.4;
const PICTURE_SIZE = 60;

// Padding to keep picture away from edges
const PADDING = 40;

// Game phases
type GamePhase = 'guessing' | 'result';

// Different pictures to show
const PICTURES = ['🎯', '⭐', '🌟', '💎', '🔮', '🎪', '🎨', '🎭', '🌸', '🍀'];

export default function PinTheTailGame({ onBrightnessChange, onExit }: MinigameProps) {
  const [phase, setPhase] = useState<GamePhase>('guessing');
  const [picturePosition, setPicturePosition] = useState({ x: 0, y: 0 });
  const [pinPosition, setPinPosition] = useState<{ x: number; y: number } | null>(null);
  const [currentPicture, setCurrentPicture] = useState('🎯');
  const [score, setScore] = useState(0);
  const [distance, setDistance] = useState(0);
  const [round, setRound] = useState(1);
  const [totalScore, setTotalScore] = useState(0);
  
  // Animations
  const pictureScale = useRef(new Animated.Value(0)).current;
  const resultScale = useRef(new Animated.Value(0)).current;

  // Generate random position for picture
  const generateRandomPosition = () => {
    const x = PADDING + Math.random() * (GAME_AREA_WIDTH - PICTURE_SIZE - PADDING * 2);
    const y = PADDING + Math.random() * (GAME_AREA_HEIGHT - PICTURE_SIZE - PADDING * 2);
    return { x, y };
  };

  // Start a new round
  const startNewRound = () => {
    const newPos = generateRandomPosition();
    setPicturePosition(newPos);
    setCurrentPicture(PICTURES[Math.floor(Math.random() * PICTURES.length)]);
    setPinPosition(null);
    setPhase('guessing');
    pictureScale.setValue(0);
    resultScale.setValue(0);
  };

  // Initialize game
  useEffect(() => {
    startNewRound();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle the pin tap
  const handlePin = (event: any) => {
    if (phase !== 'guessing') return;

    const { locationX, locationY } = event.nativeEvent;
    setPinPosition({ x: locationX, y: locationY });
    
    // Calculate distance from center of picture
    const pictureCenterX = picturePosition.x + PICTURE_SIZE / 2;
    const pictureCenterY = picturePosition.y + PICTURE_SIZE / 2;
    
    const dist = Math.sqrt(
      Math.pow(locationX - pictureCenterX, 2) + 
      Math.pow(locationY - pictureCenterY, 2)
    );
    
    setDistance(Math.round(dist));
    
    // Calculate brightness - max distance is roughly half the diagonal
    const maxDistance = Math.sqrt(
      Math.pow(GAME_AREA_WIDTH, 2) + Math.pow(GAME_AREA_HEIGHT, 2)
    ) / 2;
    
    const brightness = Math.max(0.05, 1 - (dist / maxDistance));
    const roundScore = Math.round(brightness * 100);
    
    setScore(roundScore);
    setTotalScore(prev => prev + roundScore);
    onBrightnessChange(brightness);
    
    // Show result with picture reveal animation
    setPhase('result');
    Animated.spring(pictureScale, {
      toValue: 1,
      friction: 4,
      useNativeDriver: true,
    }).start();
    Animated.spring(resultScale, {
      toValue: 1,
      friction: 5,
      useNativeDriver: true,
    }).start();
  };

  // Next round
  const handleNextRound = () => {
    setRound(prev => prev + 1);
    startNewRound();
  };

  // Get score message
  const getScoreMessage = () => {
    if (score >= 90) return { emoji: '🎯', text: 'PERFECT!' };
    if (score >= 70) return { emoji: '🔥', text: 'Amazing!' };
    if (score >= 50) return { emoji: '👍', text: 'Good job!' };
    if (score >= 30) return { emoji: '😅', text: 'Close-ish...' };
    return { emoji: '💀', text: 'Way off!' };
  };

  const scoreMessage = getScoreMessage();

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>📍 Pin the Picture</Text>
        <Text style={styles.subtitle}>
          {phase === 'guessing' && '👆 Find the hidden picture!'}
          {phase === 'result' && 'Here it was!'}
        </Text>
        <View style={styles.statsRow}>
          <Text style={styles.statText}>Round: {round}</Text>
          <Text style={styles.statText}>Total: {totalScore} pts</Text>
        </View>
      </View>

      {/* Game Area */}
      <View style={styles.gameAreaContainer}>
        <TouchableOpacity
          style={styles.gameArea}
          onPress={handlePin}
          activeOpacity={1}
          disabled={phase !== 'guessing'}
        >
          {/* Hidden picture - only revealed after guessing */}
          {phase === 'result' && (
            <Animated.View
              style={[
                styles.picture,
                {
                  left: picturePosition.x,
                  top: picturePosition.y,
                  transform: [{ scale: pictureScale }],
                },
              ]}
            >
              <Text style={styles.pictureEmoji}>{currentPicture}</Text>
            </Animated.View>
          )}

          {/* Question mark hint during guessing */}
          {phase === 'guessing' && (
            <View style={styles.questionContainer}>
              <Text style={styles.questionEmoji}>❓</Text>
              <Text style={styles.questionText}>Where is the {currentPicture}?</Text>
            </View>
          )}

          {/* Pin marker */}
          {pinPosition && phase === 'result' && (
            <View
              style={[
                styles.pin,
                {
                  left: pinPosition.x - 15,
                  top: pinPosition.y - 30,
                },
              ]}
            >
              <Text style={styles.pinEmoji}>📍</Text>
            </View>
          )}

          {/* Distance line */}
          {pinPosition && phase === 'result' && (
            <View
              style={[
                styles.distanceLine,
                {
                  left: picturePosition.x + PICTURE_SIZE / 2,
                  top: picturePosition.y + PICTURE_SIZE / 2,
                  width: distance,
                  transform: [
                    {
                      rotate: `${Math.atan2(
                        pinPosition.y - (picturePosition.y + PICTURE_SIZE / 2),
                        pinPosition.x - (picturePosition.x + PICTURE_SIZE / 2)
                      )}rad`,
                    },
                  ],
                },
              ]}
            />
          )}
        </TouchableOpacity>
      </View>

      {/* Result */}
      {phase === 'result' && (
        <Animated.View
          style={[
            styles.resultContainer,
            { transform: [{ scale: resultScale }] },
          ]}
        >
          <Text style={styles.resultEmoji}>{scoreMessage.emoji}</Text>
          <Text style={styles.resultText}>{scoreMessage.text}</Text>
          <Text style={styles.resultScore}>
            {score}% brightness
          </Text>
          <Text style={styles.distanceText}>
            {distance}px away from target
          </Text>
          
          <View style={styles.brightnessBar}>
            <View style={[styles.brightnessProgress, { width: `${score}%` }]} />
          </View>

          <View style={styles.resultButtons}>
            <TouchableOpacity style={styles.nextButton} onPress={handleNextRound}>
              <Text style={styles.nextButtonText}>🔄 Next Round</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.exitButton} onPress={onExit}>
              <Text style={styles.exitButtonText}>🚪 Exit</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}

      {/* Instructions for first round */}
      {phase === 'guessing' && round === 1 && (
        <View style={styles.instructions}>
          <Text style={styles.instructionText}>1️⃣ A picture is hidden somewhere!</Text>
          <Text style={styles.instructionText}>2️⃣ Tap anywhere to guess its location</Text>
          <Text style={styles.instructionText}>3️⃣ Closer = Brighter! 💡</Text>
          <Text style={styles.instructionText}>4️⃣ Pure luck! 🎲</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a1a',
  },
  contentContainer: {
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffd700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 20,
    marginTop: 10,
  },
  statText: {
    fontSize: 14,
    color: '#888',
  },
  gameAreaContainer: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#333',
  },
  gameArea: {
    width: GAME_AREA_WIDTH,
    height: GAME_AREA_HEIGHT,
    backgroundColor: '#1a1a2e',
    position: 'relative',
  },
  picture: {
    position: 'absolute',
    width: PICTURE_SIZE,
    height: PICTURE_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    borderRadius: PICTURE_SIZE / 2,
    borderWidth: 2,
    borderColor: '#ffd700',
  },
  pictureEmoji: {
    fontSize: 36,
  },
  pin: {
    position: 'absolute',
    zIndex: 10,
  },
  pinEmoji: {
    fontSize: 30,
  },
  distanceLine: {
    position: 'absolute',
    height: 2,
    backgroundColor: '#ef4444',
    transformOrigin: 'left center',
  },
  questionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  questionEmoji: {
    fontSize: 64,
    marginBottom: 20,
  },
  questionText: {
    fontSize: 20,
    color: '#888',
  },
  resultContainer: {
    alignItems: 'center',
    marginTop: 20,
    backgroundColor: 'rgba(26, 26, 46, 0.95)',
    padding: 25,
    borderRadius: 20,
    minWidth: 280,
    borderWidth: 2,
    borderColor: '#333',
  },
  resultEmoji: {
    fontSize: 48,
    marginBottom: 10,
  },
  resultText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffd700',
    marginBottom: 5,
  },
  resultScore: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  distanceText: {
    fontSize: 14,
    color: '#888',
    marginBottom: 15,
  },
  brightnessBar: {
    width: 200,
    height: 16,
    backgroundColor: '#333',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 20,
  },
  brightnessProgress: {
    height: '100%',
    backgroundColor: '#ffd700',
    borderRadius: 8,
  },
  resultButtons: {
    flexDirection: 'row',
    gap: 15,
  },
  nextButton: {
    backgroundColor: '#4ade80',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 25,
  },
  nextButtonText: {
    fontSize: 16,
    color: '#000',
    fontWeight: 'bold',
  },
  exitButton: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 25,
  },
  exitButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  instructions: {
    marginTop: 20,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 15,
    borderRadius: 15,
  },
  instructionText: {
    fontSize: 14,
    color: '#ccc',
    marginVertical: 2,
  },
});
