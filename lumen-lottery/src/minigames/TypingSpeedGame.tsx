// Typing Speed Lux Game
// Type faster to brighten the screen

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { MinigameProps } from '../types/Minigame';

type PromptLength = 'short' | 'medium' | 'long';

const PROMPTS: Record<PromptLength, string[]> = {
  short: [
    'Light chases those who chase the keys.',
    'Bright ideas arrive when your fingers fly.',
    'Speed is the path to lumen glory.',
    'Keep your cadence smooth and steady.',
    'WPM is the fuel; brightness is the reward.',
    'Momentum matters more than perfection.',
  ],
  medium: [
    'Type like dawn is rising and every word invites a new ray of light into the room.',
    'Your rhythm is a metronome for the screen; steady strokes keep the glow alive.',
    'When the pace is smooth, the brightness follows. Hesitation dims the path ahead.',
    'Let your thoughts tumble out. The faster they land, the brighter your world becomes.',
    'Confidence is a backspace saver. Trust your flow and the luminance will keep up.',
    'Cruise at a comfortable cadence; bursts of speed will spike the glow when you need it.',
  ],
  long: [
    'Typing is a quiet sprint. Each five characters count as a stride, pushing you forward and keeping the light alive. Settle into a pace that feels like jogging downhill, where your fingers are just trying to keep up with your ideas.',
    'Every sentence is a fuse. As you add words, the glow climbs higher, reflecting the momentum of your thoughts. When you pause too long, the fuse fizzles, and darkness reminds you to move again.',
    'Consistency beats chaos. A calm, repeatable rhythm will outperform frantic bursts of speed. Hold a steady tempo, correct lightly, and watch the display stay bright as your cadence locks in.',
    'Imagine the screen as a sun tethered to your keyboard. Each correctly typed phrase pulls it upward. Misses create drag, so breathe, stay smooth, and keep tugging the light toward noon.',
    'Your typing posture is part of the race. Relax the shoulders, float the wrists, and let the hands glide. Comfort sustains speed longer than adrenaline ever will.',
    'Momentum is fragile. Treat pauses like pit stops: brief, intentional, and followed by a decisive return to pace so the brightness never has time to fade.',
  ],
};

const MAX_WPM = 140;
const MIN_BRIGHTNESS = 0.02;
const IDLE_DECAY_PER_SECOND = 40; // higher = faster brightness drop when idle

function randomPrompt(length: PromptLength): string {
  const pool = PROMPTS[length];
  return pool[Math.floor(Math.random() * pool.length)];
}

function mapWpmToBrightness(wpm: number): number {
  const clamped = Math.max(0, Math.min(MAX_WPM, wpm));
  return MIN_BRIGHTNESS + (clamped / MAX_WPM) * (1 - MIN_BRIGHTNESS);
}

export default function TypingSpeedGame({ onBrightnessChange, onExit }: MinigameProps) {
  const [promptLength, setPromptLength] = useState<PromptLength>('medium');
  const [prompt, setPrompt] = useState<string>(() => randomPrompt('medium'));
  const [input, setInput] = useState('');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [wpm, setWpm] = useState(0);
  const [bestWpm, setBestWpm] = useState(0);
  const inputRef = useRef<TextInput | null>(null);
  const lastInputRef = useRef<number | null>(null);

  const calculateWpm = useCallback((text: string, startedAt: number | null) => {
    if (!startedAt || text.length === 0) return 0;
    const elapsedMinutes = Math.max((Date.now() - startedAt) / 60000, 1 / 60);
    const wordsTyped = text.length / 5;
    return Math.max(0, Math.round((wordsTyped / elapsedMinutes) * 10) / 10);
  }, []);

  const completed = input === prompt && prompt.length > 0;

  useEffect(() => {
    if (completed) return undefined;
    const id = setInterval(() => {
      const base = calculateWpm(input, startTime);
      const idleSeconds = lastInputRef.current ? (Date.now() - lastInputRef.current) / 1000 : 0;
      const decayed = Math.max(0, base - idleSeconds * IDLE_DECAY_PER_SECOND);
      setWpm(Math.round(decayed * 10) / 10);
    }, 400);
    return () => clearInterval(id);
  }, [calculateWpm, input, startTime, completed]);

  useEffect(() => {
    setBestWpm((prev) => Math.max(prev, wpm));
    onBrightnessChange(mapWpmToBrightness(wpm));
  }, [wpm, onBrightnessChange]);

  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 300);
    return () => clearTimeout(timer);
  }, []);

  const handleChange = (text: string) => {
    if (text.length > prompt.length) return;
    if (!startTime && text.length > 0) {
      setStartTime(Date.now());
    }
    lastInputRef.current = Date.now();
    setInput(text);
    setWpm(calculateWpm(text, startTime ?? Date.now()));
  };

  const handleReset = (length: PromptLength = promptLength) => {
    setPromptLength(length);
    setPrompt(randomPrompt(length));
    setInput('');
    setStartTime(null);
    setWpm(0);
    lastInputRef.current = null;
  };

  const progress = useMemo(() => Math.min(input.length / prompt.length, 1), [input.length, prompt.length]);

  const mismatchIndex = useMemo(() => {
    for (let i = 0; i < input.length && i < prompt.length; i++) {
      if (input[i] !== prompt[i]) return i;
    }
    return -1;
  }, [input, prompt]);

  const correctPortion = prompt.slice(0, mismatchIndex === -1 ? Math.min(input.length, prompt.length) : mismatchIndex);
  const errorPortion = mismatchIndex === -1 ? '' : prompt.slice(mismatchIndex, Math.min(input.length, prompt.length));
  const remainingPortion = prompt.slice(Math.min(input.length, prompt.length));

  const accuracy = useMemo(() => {
    if (input.length === 0) return 100;
    const errors = mismatchIndex === -1 ? 0 : input.length - mismatchIndex;
    const correct = Math.max(input.length - errors, 0);
    return Math.max(0, Math.round((correct / input.length) * 100));
  }, [input.length, mismatchIndex]);

  useEffect(() => {
    if (!completed) return undefined;
    const finalBrightness = mapWpmToBrightness(wpm);
    onBrightnessChange(finalBrightness);
    const timeout = setTimeout(onExit, 700);
    return () => clearTimeout(timeout);
  }, [completed, wpm, onBrightnessChange, onExit]);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Type Racer Lux</Text>
        <TouchableOpacity onPress={onExit} style={styles.exitButton}>
          <Text style={styles.exitText}>Exit</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.promptCard}>
        <Text style={styles.label}>Prompt</Text>
        <Text style={styles.promptText}>
          <Text style={styles.correctText}>{correctPortion}</Text>
          <Text style={styles.errorText}>{errorPortion}</Text>
          <Text style={styles.remainingText}>{remainingPortion}</Text>
        </Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>WPM</Text>
          <Text style={styles.statValue}>{wpm.toFixed(1)}</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Best</Text>
          <Text style={styles.statValue}>{bestWpm.toFixed(1)}</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Accuracy</Text>
          <Text style={styles.statValue}>{accuracy}%</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Brightness</Text>
          <Text style={styles.statValue}>{Math.round(mapWpmToBrightness(wpm) * 100)}%</Text>
        </View>
      </View>

      <View style={styles.lengthRow}>
        {(['short', 'medium', 'long'] as PromptLength[]).map((len) => (
          <TouchableOpacity
            key={len}
            onPress={() => handleReset(len)}
            style={[styles.lengthChip, promptLength === len && styles.lengthChipActive]}
          >
            <Text style={[styles.lengthChipText, promptLength === len && styles.lengthChipTextActive]}>
              {len.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TextInput
        ref={inputRef}
        style={styles.input}
        value={input}
        onChangeText={handleChange}
        placeholder="Start typing..."
        placeholderTextColor="#5f6a8a"
        autoCorrect={false}
        autoCapitalize="none"
        autoFocus
        multiline
      />

      <View style={styles.footer}>
        <Text style={styles.helper}>
          Type faster to brighten the screen. WPM updates every second. Stop typing and brightness fades.
        </Text>
        <View style={styles.footerButtons}>
          <TouchableOpacity onPress={() => handleReset(promptLength)} style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>{completed ? 'New Prompt' : 'Shuffle'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setInput('')} style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Clear</Text>
          </TouchableOpacity>
        </View>
        {completed && <Text style={styles.success}>Prompt complete! Tap New Prompt to race again.</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f23',
    paddingHorizontal: 16,
    paddingTop: 48,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  title: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  exitButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#1f2b4a',
    borderRadius: 8,
  },
  exitText: {
    color: '#e74c3c',
    fontWeight: 'bold',
    fontSize: 14,
  },
  promptCard: {
    backgroundColor: '#16213e',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#23345f',
  },
  label: {
    color: '#7f9cc4',
    fontSize: 12,
    letterSpacing: 0.5,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  promptText: {
    color: '#b7c8e8',
    fontSize: 18,
    lineHeight: 26,
    marginBottom: 10,
  },
  correctText: {
    color: '#7bed8d',
  },
  errorText: {
    color: '#ff7b7b',
    textDecorationLine: 'underline',
  },
  remainingText: {
    color: '#5f6a8a',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#0d1630',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#ffd54f',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  lengthRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  lengthChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#1f2b4a',
    borderRadius: 10,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#23345f',
  },
  lengthChipActive: {
    backgroundColor: '#ffd54f',
    borderColor: '#ffd54f',
  },
  lengthChipText: {
    color: '#b7c8e8',
    fontWeight: 'bold',
    fontSize: 13,
    letterSpacing: 0.5,
  },
  lengthChipTextActive: {
    color: '#0f0f23',
  },
  stat: {
    flex: 1,
    backgroundColor: '#121a33',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 8,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#1f2b4a',
  },
  statLabel: {
    color: '#7f9cc4',
    fontSize: 12,
    marginBottom: 4,
    textAlign: 'center',
  },
  statValue: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  input: {
    flexGrow: 1,
    minHeight: 140,
    backgroundColor: '#11182f',
    borderRadius: 12,
    padding: 14,
    color: '#e1e8ff',
    fontSize: 18,
    lineHeight: 26,
    borderWidth: 1,
    borderColor: '#1f2b4a',
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  footer: {
    paddingBottom: 20,
  },
  helper: {
    color: '#7f9cc4',
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 10,
  },
  footerButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 8,
  },
  secondaryButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#1f2b4a',
    borderRadius: 10,
    marginRight: 10,
  },
  secondaryButtonText: {
    color: '#ffd54f',
    fontWeight: 'bold',
  },
  success: {
    color: '#7bed8d',
    fontSize: 14,
    marginTop: 4,
  },
});
