// Math Quiz Lux Game - NIGHTMARE EDITION
// Developer: Copilot
//
// Rules:
// - Answer math questions to control brightness
// - Correct = tiny brightness gain (+2%)
// - Wrong = MASSIVE brightness drop (-25%)
// - But the questions are EVIL: Roman numerals, binary, word problems,
//   upside down text, moving buttons, and more!

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { MinigameProps } from '../types/Minigame';

type QuestionType = 'normal' | 'roman' | 'binary' | 'hex' | 'words' | 'emoji' | 'backwards' | 'trick';

interface Question {
  question: string;
  correctAnswer: number;
  options: number[];
  type: QuestionType;
  timeLimit: number;
  explanation?: string;
}

// Convert number to Roman numerals
const toRoman = (num: number): string => {
  const romanNumerals: [number, string][] = [
    [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'],
    [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'],
    [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']
  ];
  let result = '';
  for (const [value, symbol] of romanNumerals) {
    while (num >= value) {
      result += symbol;
      num -= value;
    }
  }
  return result;
};

// Convert number to binary
const toBinary = (num: number): string => num.toString(2);

// Convert number to hex
const toHex = (num: number): string => num.toString(16).toUpperCase();

// Number to words
const toWords = (num: number): string => {
  const ones = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine',
    'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
  const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
  
  if (num < 20) return ones[num];
  if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 ? '-' + ones[num % 10] : '');
  if (num < 1000) return ones[Math.floor(num / 100)] + ' hundred' + (num % 100 ? ' and ' + toWords(num % 100) : '');
  return num.toString();
};

// Flip text upside down
const flipText = (str: string): string => {
  const flipMap: { [key: string]: string } = {
    'a': 'ɐ', 'b': 'q', 'c': 'ɔ', 'd': 'p', 'e': 'ǝ', 'f': 'ɟ', 'g': 'ƃ', 'h': 'ɥ',
    'i': 'ᴉ', 'j': 'ɾ', 'k': 'ʞ', 'l': 'l', 'm': 'ɯ', 'n': 'u', 'o': 'o', 'p': 'd',
    'q': 'b', 'r': 'ɹ', 's': 's', 't': 'ʇ', 'u': 'n', 'v': 'ʌ', 'w': 'ʍ', 'x': 'x',
    'y': 'ʎ', 'z': 'z', '0': '0', '1': 'Ɩ', '2': 'ᄅ', '3': 'Ɛ', '4': 'ㄣ', '5': 'ϛ',
    '6': '9', '7': 'ㄥ', '8': '8', '9': '6', '+': '+', '-': '-', '×': '×', '÷': '÷',
    '=': '=', '?': '¿', ' ': ' '
  };
  return str.split('').reverse().map(c => flipMap[c.toLowerCase()] || c).join('');
};

// Generate a random question
const generateQuestion = (difficulty: number): Question => {
  const types: QuestionType[] = ['normal', 'roman', 'binary', 'hex', 'words', 'emoji', 'backwards', 'trick'];
  const type = types[Math.floor(Math.random() * types.length)];
  
  let a: number, b: number, correctAnswer: number, question: string;
  const operations = ['+', '-', '×'];
  const op = operations[Math.floor(Math.random() * operations.length)];
  
  // Increase numbers based on difficulty
  const maxNum = Math.min(10 + difficulty * 5, 100);
  
  a = Math.floor(Math.random() * maxNum) + 1;
  b = Math.floor(Math.random() * maxNum) + 1;
  
  // Ensure subtraction doesn't go negative (usually)
  if (op === '-' && b > a) [a, b] = [b, a];
  
  switch (op) {
    case '+': correctAnswer = a + b; break;
    case '-': correctAnswer = a - b; break;
    case '×': correctAnswer = a * b; break;
    default: correctAnswer = a + b;
  }

  // Generate the question text based on type
  switch (type) {
    case 'roman':
      question = `${toRoman(a)} ${op} ${toRoman(b)} = ?`;
      break;
    case 'binary':
      question = `${toBinary(a)} ${op} ${toBinary(b)} = ? (binary math!)`;
      break;
    case 'hex':
      question = `0x${toHex(a)} ${op} 0x${toHex(b)} = ? (hex values!)`;
      break;
    case 'words':
      question = `${toWords(a)} ${op === '+' ? 'plus' : op === '-' ? 'minus' : 'times'} ${toWords(b)} equals?`;
      break;
    case 'emoji':
      const emojis = ['🍎', '🍕', '🌟', '🎈', '🔥', '💎', '🎮', '🚀'];
      const emoji1 = emojis[Math.floor(Math.random() * emojis.length)];
      const emoji2 = emojis[Math.floor(Math.random() * emojis.length)];
      question = `If ${emoji1}=${a} and ${emoji2}=${b}, what is ${emoji1} ${op} ${emoji2}?`;
      break;
    case 'backwards':
      question = flipText(`${a} ${op} ${b} = ?`);
      break;
    case 'trick':
      // Trick questions with confusing wording
      const tricks = [
        { q: `What is ${a} ${op} ${b}? (Hint: the answer is NOT ${correctAnswer + 1})`, a: correctAnswer },
        { q: `${a} ${op} ${b} = ${correctAnswer}. True or false? Just kidding, what IS ${a} ${op} ${b}?`, a: correctAnswer },
        { q: `Ignore this: ${Math.random().toFixed(2)}. Calculate: ${a} ${op} ${b}`, a: correctAnswer },
        { q: `Quick! ${a} ${op} ${b}! No time to think!`, a: correctAnswer },
      ];
      const trick = tricks[Math.floor(Math.random() * tricks.length)];
      question = trick.q;
      break;
    default:
      question = `${a} ${op} ${b} = ?`;
  }

  // Generate wrong options that are close to the correct answer
  const options: number[] = [correctAnswer];
  while (options.length < 4) {
    const offset = Math.floor(Math.random() * 10) - 5;
    const wrongAnswer = correctAnswer + (offset === 0 ? 1 : offset);
    if (!options.includes(wrongAnswer) && wrongAnswer >= 0) {
      options.push(wrongAnswer);
    }
  }
  
  // Shuffle options
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }

  // Time limit based on difficulty and type
  let timeLimit = 10;
  if (type === 'roman' || type === 'words' || type === 'backwards') timeLimit = 8;
  if (type === 'binary' || type === 'hex') timeLimit = 12;
  if (difficulty > 5) timeLimit -= 2;
  if (difficulty > 10) timeLimit -= 2;
  timeLimit = Math.max(4, timeLimit);

  return { question, correctAnswer, options, type, timeLimit };
};

const MOCK_MESSAGES = [
  'Really? That was easy!',
  'A calculator could do better.',
  'Did you even go to school?',
  'My grandma solves these faster.',
  'Are you even trying?',
  'Wrong. Shocking.',
  'Math is not your thing, huh?',
  'Oops! Back to kindergarten!',
];

const PATRONIZING_CORRECT = [
  'Finally! One correct!',
  'Wow, you CAN do math!',
  'Even a broken clock...',
  'Lucky guess?',
  'Okay, but can you do it again?',
];

export default function MathQuizGame({ onBrightnessChange, onExit }: MinigameProps) {
  const [brightness, setBrightness] = useState(0.5);
  const [question, setQuestion] = useState<Question>(generateQuestion(1));
  const [timeLeft, setTimeLeft] = useState(10);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [message, setMessage] = useState('Solve to brighten!');
  const [difficulty, setDifficulty] = useState(1);
  const [buttonsShuffled, setButtonsShuffled] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingAnswer, setPendingAnswer] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const buttonPositions = useRef([0, 1, 2, 3].map(() => new Animated.Value(0))).current;

  const triggerShake = useCallback(() => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 15, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -15, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 15, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -15, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  }, [shakeAnim]);

  // Timer
  useEffect(() => {
    if (showConfirmation || isProcessing) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // Handle timeout inline
          setBrightness(curr => {
            const newBrightness = Math.max(0, curr - 0.2);
            onBrightnessChange(newBrightness);
            return newBrightness;
          });
          setWrongCount(c => c + 1);
          setStreak(0);
          setMessage('⏰ Too slow! -20%');
          triggerShake();
          // Load new question inline
          setScore(s => {
            const newDifficulty = Math.floor(s / 3) + 1;
            setDifficulty(newDifficulty);
            const newQ = generateQuestion(newDifficulty);
            setQuestion(newQ);
            setTimeLeft(newQ.timeLimit);
            return s;
          });
          return question.timeLimit;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [showConfirmation, isProcessing, question.timeLimit, onBrightnessChange, triggerShake]);

  // Randomly shuffle buttons
  useEffect(() => {
    const shuffleInterval = setInterval(() => {
      if (Math.random() < 0.15 && !showConfirmation) {
        // Shuffle buttons inline
        setButtonsShuffled(true);
        buttonPositions.forEach((anim) => {
          Animated.sequence([
            Animated.timing(anim, {
              toValue: (Math.random() - 0.5) * 50,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.timing(anim, {
              toValue: 0,
              duration: 200,
              useNativeDriver: true,
            }),
          ]).start();
        });
        
        // Shuffle the question options
        setQuestion(prev => ({
          ...prev,
          options: [...prev.options].sort(() => Math.random() - 0.5),
        }));
        
        setTimeout(() => setButtonsShuffled(false), 500);
        setMessage('🔀 Buttons shuffled!');
      }
    }, 4000);

    return () => clearInterval(shuffleInterval);
  }, [showConfirmation, buttonPositions]);

  const loadNewQuestion = useCallback(() => {
    const newDifficulty = Math.floor(score / 3) + 1;
    setDifficulty(newDifficulty);
    const newQ = generateQuestion(newDifficulty);
    setQuestion(newQ);
    setTimeLeft(newQ.timeLimit);
  }, [score]);

  const handleAnswer = (answer: number) => {
    if (isProcessing || buttonsShuffled) return;

    // Random "Are you sure?" confirmation (20% chance)
    if (Math.random() < 0.2 && !showConfirmation) {
      setPendingAnswer(answer);
      setShowConfirmation(true);
      return;
    }

    processAnswer(answer);
  };

  const processAnswer = (answer: number) => {
    setIsProcessing(true);
    setShowConfirmation(false);
    setPendingAnswer(null);

    const isCorrect = answer === question.correctAnswer;

    // Fake processing delay
    setTimeout(() => {
      if (isCorrect) {
        // Correct! Tiny brightness gain
        const gain = 0.02 + (streak * 0.005); // Streak bonus
        const newBrightness = Math.min(1, brightness + gain);
        setBrightness(newBrightness);
        onBrightnessChange(newBrightness);
        setScore(prev => prev + 1);
        setStreak(prev => prev + 1);
        setMessage(PATRONIZING_CORRECT[Math.floor(Math.random() * PATRONIZING_CORRECT.length)]);
      } else {
        // Wrong! MASSIVE brightness drop
        const penalty = 0.25;
        const newBrightness = Math.max(0, brightness - penalty);
        setBrightness(newBrightness);
        onBrightnessChange(newBrightness);
        setWrongCount(prev => prev + 1);
        setStreak(0);
        setMessage(MOCK_MESSAGES[Math.floor(Math.random() * MOCK_MESSAGES.length)]);
        triggerShake();
      }

      setIsProcessing(false);
      loadNewQuestion();
    }, 500);
  };

  const confirmAnswer = (confirmed: boolean) => {
    if (confirmed && pendingAnswer !== null) {
      processAnswer(pendingAnswer);
    } else {
      setShowConfirmation(false);
      setPendingAnswer(null);
      setMessage('Changed your mind? Timer is still running!');
    }
  };

  const getTypeLabel = (type: QuestionType): string => {
    switch (type) {
      case 'roman': return '🏛️ ROMAN';
      case 'binary': return '💻 BINARY';
      case 'hex': return '🔢 HEX';
      case 'words': return '📝 WORDS';
      case 'emoji': return '😀 EMOJI';
      case 'backwards': return '🙃 FLIPPED';
      case 'trick': return '🎭 TRICK';
      default: return '📊 NORMAL';
    }
  };

  const getTimerColor = () => {
    if (timeLeft > 6) return '#4ade80';
    if (timeLeft > 3) return '#fbbf24';
    return '#ef4444';
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🧮 Math Quiz Lux 🧮</Text>
      <Text style={styles.subtitle}>NIGHTMARE EDITION</Text>

      {/* Stats row */}
      <View style={styles.statsRow}>
        <Text style={styles.statText}>✅ {score}</Text>
        <Text style={styles.statText}>❌ {wrongCount}</Text>
        <Text style={styles.statText}>🔥 {streak}</Text>
        <Text style={styles.statText}>📈 Lv.{difficulty}</Text>
      </View>

      {/* Brightness bar */}
      <View style={styles.brightnessContainer}>
        <View style={styles.brightnessBar}>
          <View style={[styles.brightnessLevel, { width: `${brightness * 100}%` }]} />
        </View>
        <Text style={styles.brightnessText}>{Math.round(brightness * 100)}%</Text>
      </View>

      {/* Timer */}
      <Text style={[styles.timer, { color: getTimerColor() }]}>
        ⏱️ {timeLeft}s
      </Text>

      {/* Question type badge */}
      <View style={styles.typeBadge}>
        <Text style={styles.typeBadgeText}>{getTypeLabel(question.type)}</Text>
      </View>

      {/* Question */}
      <Animated.View style={[styles.questionBox, { transform: [{ translateX: shakeAnim }] }]}>
        <Text style={[
          styles.questionText,
          question.type === 'backwards' && styles.backwardsText
        ]}>
          {question.question}
        </Text>
      </Animated.View>

      {/* Answer buttons */}
      {showConfirmation ? (
        <View style={styles.confirmationBox}>
          <Text style={styles.confirmationText}>
            Are you SURE you want to answer {pendingAnswer}?
          </Text>
          <View style={styles.confirmationButtons}>
            <TouchableOpacity 
              style={[styles.confirmBtn, styles.confirmYes]}
              onPress={() => confirmAnswer(true)}
            >
              <Text style={styles.confirmBtnText}>Yes, I am sure</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.confirmBtn, styles.confirmNo]}
              onPress={() => confirmAnswer(false)}
            >
              <Text style={styles.confirmBtnText}>No, let me think</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.answersGrid}>
          {question.options.map((option, index) => (
            <Animated.View
              key={index}
              style={{ transform: [{ translateX: buttonPositions[index] }] }}
            >
              <TouchableOpacity
                style={[
                  styles.answerButton,
                  isProcessing && styles.disabledButton,
                ]}
                onPress={() => handleAnswer(option)}
                disabled={isProcessing || buttonsShuffled}
              >
                <Text style={styles.answerText}>{option}</Text>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>
      )}

      {/* Message */}
      <Text style={styles.message}>{message}</Text>

      {/* Info */}
      <View style={styles.infoBox}>
        <Text style={styles.infoText}>
          ✓ Correct = +2% (+ streak bonus){'\n'}
          ✗ Wrong = -25% 💀{'\n'}
          ⏰ Timeout = -20%
        </Text>
      </View>

      {/* Exit */}
      <TouchableOpacity style={styles.exitButton} onPress={onExit}>
        <Text style={styles.exitText}>🚪 Give Up (Math is Hard)</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    paddingTop: 35,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 12,
    color: '#ff4444',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 10,
  },
  statText: {
    fontSize: 14,
    color: '#aaa',
  },
  brightnessContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '85%',
    marginBottom: 10,
  },
  brightnessBar: {
    flex: 1,
    height: 14,
    backgroundColor: '#333',
    borderRadius: 7,
    overflow: 'hidden',
    marginRight: 10,
  },
  brightnessLevel: {
    height: '100%',
    backgroundColor: '#ffd700',
    borderRadius: 7,
  },
  brightnessText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: 'bold',
    width: 45,
  },
  timer: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  typeBadge: {
    backgroundColor: '#4a4a8a',
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 15,
    marginBottom: 15,
  },
  typeBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  questionBox: {
    backgroundColor: '#2d2d5a',
    padding: 20,
    borderRadius: 15,
    width: '100%',
    minHeight: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#ffd700',
  },
  questionText: {
    fontSize: 22,
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  backwardsText: {
    transform: [{ rotate: '180deg' }],
  },
  answersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 15,
  },
  answerButton: {
    backgroundColor: '#4285f4',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    minWidth: 100,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#666',
  },
  answerText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  confirmationBox: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 15,
  },
  confirmationText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 15,
  },
  confirmationButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  confirmBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  confirmYes: {
    backgroundColor: '#4ade80',
  },
  confirmNo: {
    backgroundColor: '#ef4444',
  },
  confirmBtnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  message: {
    fontSize: 14,
    color: '#ff6b6b',
    textAlign: 'center',
    marginBottom: 10,
    minHeight: 20,
    fontStyle: 'italic',
  },
  infoBox: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  infoText: {
    fontSize: 11,
    color: '#888',
    textAlign: 'center',
    lineHeight: 16,
  },
  exitButton: {
    paddingVertical: 10,
    paddingHorizontal: 25,
    backgroundColor: '#333',
    borderRadius: 20,
  },
  exitText: {
    color: '#fff',
    fontSize: 13,
  },
});
