// Peer Pressure Slider Game
// "Are you SURE?" - asks again and again

import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Dimensions,
} from 'react-native';
import { MinigameProps } from '../types/Minigame';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// 20 Confirmation questions
const QUESTIONS = [
  "Are you SURE you want it brighter?",
  "Are you REALLY sure?",
  "Like, 100% sure?",
  "You're not going to regret this?",
  "Have you consulted an optometrist?",
  "What about your electricity bill?",
  "Did you consider the environment?",
  "Are your eyes even ready for this?",
  "Have you said goodbye to darkness?",
  "Is this really what you want in life?",
  "No second thoughts?",
  "You've thought this through, right?",
  "What would your mother say?",
  "Are you in a well-lit room already?",
  "Have you tried just... going outside?",
  "This is your 16th confirmation. Still sure?",
  "We're running out of ways to ask...",
  "Okay but like, REALLY really sure?",
  "Last chance to back out (not really)...",
  "FINAL ANSWER: Do you want it brighter?",
];

// Generate random button positions
const getRandomPosition = () => {
  const buttonWidth = 180;
  const buttonHeight = 50;
  const safeTop = 250; // Below header
  const safeBottom = 150; // Above instructions
  
  return {
    top: Math.random() * (SCREEN_HEIGHT - safeTop - safeBottom - buttonHeight) + safeTop,
    left: Math.random() * (SCREEN_WIDTH - buttonWidth - 40) + 20,
  };
};

export default function PeerPressureGame({ onBrightnessChange }: MinigameProps) {
  const [brightness, setBrightness] = useState(0.2);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [yesPosition, setYesPosition] = useState(getRandomPosition());
  const [noPosition, setNoPosition] = useState(getRandomPosition());
  const [completed, setCompleted] = useState(false);

  // Set initial brightness
  useEffect(() => {
    onBrightnessChange(0.2);
  }, [onBrightnessChange]);

  // Randomize button positions on each question
  const randomizeButtons = () => {
    setYesPosition(getRandomPosition());
    setNoPosition(getRandomPosition());
  };

  const handleYes = () => {
    if (questionIndex < QUESTIONS.length - 1) {
      setQuestionIndex(questionIndex + 1);
      randomizeButtons();
    } else {
      // Completed all 20 questions - 100% brightness!
      setBrightness(1.0);
      onBrightnessChange(1.0);
      setCompleted(true);
    }
  };

  const handleNo = () => {
    // Reset to 20% and first question
    setBrightness(0.2);
    onBrightnessChange(0.2);
    setQuestionIndex(0);
    randomizeButtons();
  };

  const handlePlayAgain = () => {
    setBrightness(0.2);
    onBrightnessChange(0.2);
    setQuestionIndex(0);
    setCompleted(false);
    randomizeButtons();
  };

  // Completed state
  if (completed) {
    return (
      <View style={styles.container}>
        <Text style={styles.emoji}>🎉</Text>
        <Text style={styles.title}>YOU DID IT!</Text>
        <Text style={styles.completedText}>
          100% MAXIMUM BRIGHTNESS ACHIEVED!
        </Text>
        <TouchableOpacity style={styles.playAgainButton} onPress={handlePlayAgain}>
          <Text style={styles.playAgainText}>Play Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Questioning state
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>😰</Text>
      <Text style={styles.title}>Peer Pressure Slider</Text>
      
      <Text style={styles.brightnessText}>
        Current: {Math.round(brightness * 100)}%
      </Text>

      <View style={styles.questionBox}>
        <Text style={styles.questionText}>{QUESTIONS[questionIndex]}</Text>
        <Text style={styles.progressText}>
          Question {questionIndex + 1} of {QUESTIONS.length}
        </Text>
      </View>

      {/* Randomly positioned buttons */}
      <TouchableOpacity 
        style={[styles.floatingButton, styles.noButton, { top: noPosition.top, left: noPosition.left }]} 
        onPress={handleNo}
      >
        <Text style={styles.noButtonText}>No</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.floatingButton, styles.yesButton, { top: yesPosition.top, left: yesPosition.left }]} 
        onPress={handleYes}
      >
        <Text style={styles.yesButtonText}>Yes</Text>
      </TouchableOpacity>

      <View style={styles.bottomHint}>
        <Text style={styles.hintText}>
          Find the buttons... they move each time!
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  emoji: {
    fontSize: 60,
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  brightnessText: {
    fontSize: 18,
    color: '#ffd700',
    marginBottom: 20,
  },
  questionBox: {
    backgroundColor: '#2a2a4e',
    borderRadius: 20,
    padding: 25,
    width: '100%',
    alignItems: 'center',
  },
  questionText: {
    fontSize: 20,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 15,
    lineHeight: 28,
  },
  progressText: {
    fontSize: 14,
    color: '#888',
  },
  floatingButton: {
    position: 'absolute',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 12,
    minWidth: 100,
    alignItems: 'center',
  },
  yesButton: {
    backgroundColor: '#4ade80',
  },
  yesButtonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  noButton: {
    backgroundColor: '#ef4444',
  },
  noButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  bottomHint: {
    position: 'absolute',
    bottom: 50,
    left: 20,
    right: 20,
  },
  hintText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  completedText: {
    fontSize: 20,
    color: '#ffd700',
    textAlign: 'center',
    marginBottom: 30,
  },
  playAgainButton: {
    backgroundColor: '#4ade80',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 12,
  },
  playAgainText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
