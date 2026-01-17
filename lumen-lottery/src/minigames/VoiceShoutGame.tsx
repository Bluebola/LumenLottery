import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Audio } from 'expo-av';
import { MinigameProps } from '../types/Minigame';

const VoiceShoutGame: React.FC<MinigameProps> = ({ onBrightnessChange }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [currentVolume, setCurrentVolume] = useState(0);
  const [brightness, setBrightness] = useState(0.05);
  const [peakVolume, setPeakVolume] = useState(0);
  
  const recordingRef = useRef<Audio.Recording | null>(null);
  const meteringIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const decayIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const onBrightnessChangeRef = useRef(onBrightnessChange);
  
  // Keep ref updated
  useEffect(() => {
    onBrightnessChangeRef.current = onBrightnessChange;
  }, [onBrightnessChange]);

  const stopRecording = useCallback(async () => {
    if (recordingRef.current) {
      try {
        await recordingRef.current.stopAndUnloadAsync();
      } catch {
        // Already stopped
      }
      recordingRef.current = null;
    }
    setIsRecording(false);
  }, []);

  const startRecording = useCallback(async () => {
    try {
      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync({
        ...Audio.RecordingOptionsPresets.HIGH_QUALITY,
        isMeteringEnabled: true,
      });
      await recording.startAsync();
      recordingRef.current = recording;
      setIsRecording(true);

      // Poll for metering data
      meteringIntervalRef.current = setInterval(async () => {
        if (recordingRef.current) {
          try {
            const status = await recordingRef.current.getStatusAsync();
            if (status.isRecording && status.metering !== undefined) {
              // Metering is in dB, typically -160 to 0
              // Apply noise gate: ignore anything below -35 dB (higher threshold for ambient noise)
              const db = status.metering;
              const NOISE_FLOOR_DB = -35; // Ignore sounds quieter than this (raised from -45)
              
              // If below noise floor, treat as silence
              if (db < NOISE_FLOOR_DB) {
                setCurrentVolume(0);
                // Directly set brightness to minimum when silent
                const newBrightness = 0.05;
                setBrightness(newBrightness);
                onBrightnessChangeRef.current(newBrightness);
                return;
              }
              
              // Map from noise floor to 0 dB onto 0-100 scale
              // This effectively suppresses ambient noise
              const effectiveDb = db - NOISE_FLOOR_DB;
              const maxRange = 0 - NOISE_FLOOR_DB; // e.g., 35 dB range
              const normalizedVolume = Math.max(0, Math.min(100, (effectiveDb / maxRange) * 100));
              
              setCurrentVolume(normalizedVolume);
              
              // Track peak
              setPeakVolume(prev => Math.max(prev, normalizedVolume));

              // Brightness directly maps to volume (0-100% volume = 5-100% brightness)
              const newBrightness = 0.05 + (normalizedVolume / 100) * 0.95;
              setBrightness(newBrightness);
              onBrightnessChangeRef.current(newBrightness);
            }
          } catch {
            // Recording may have stopped
          }
        }
      }, 50);
    } catch (error) {
      console.error('Failed to start recording', error);
    }
  }, []);

  // Request microphone permission
  useEffect(() => {
    (async () => {
      const { status } = await Audio.requestPermissionsAsync();
      setHasPermission(status === 'granted');
      
      if (status === 'granted') {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });
        startRecording();
      }
    })();

    return () => {
      stopRecording();
      if (meteringIntervalRef.current) {
        clearInterval(meteringIntervalRef.current);
      }
      if (decayIntervalRef.current) {
        clearInterval(decayIntervalRef.current);
      }
    };
  }, [startRecording, stopRecording]);

  // Pulse animation based on volume - use JS driver for consistency with color interpolation
  useEffect(() => {
    const scale = 1 + (currentVolume / 100) * 0.5;
    Animated.spring(pulseAnim, {
      toValue: scale,
      friction: 3,
      tension: 100,
      useNativeDriver: false,
    }).start();

    Animated.timing(glowAnim, {
      toValue: currentVolume / 100,
      duration: 100,
      useNativeDriver: false,
    }).start();
  }, [currentVolume, pulseAnim, glowAnim]);

  // No decay needed - brightness directly maps to volume now
  // When you stop shouting, volume drops, brightness drops with it

  const getVolumeEmoji = () => {
    if (currentVolume < 10) return '🤫';
    if (currentVolume < 30) return '🗣️';
    if (currentVolume < 50) return '📢';
    if (currentVolume < 70) return '🔊';
    if (currentVolume < 90) return '📣';
    return '🤯';
  };

  const getVolumeMessage = () => {
    if (currentVolume < 10) return 'Speak up...';
    if (currentVolume < 30) return 'I can barely hear you!';
    if (currentVolume < 50) return 'Getting louder...';
    if (currentVolume < 70) return 'LOUDER!!!';
    if (currentVolume < 90) return 'MAXIMUM VOLUME!';
    return 'LEGENDARY SHOUT!!!';
  };

  const brightnessPercent = Math.round(brightness * 100);

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Requesting microphone access...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorEmoji}>🎤❌</Text>
        <Text style={styles.errorText}>Microphone access denied!</Text>
        <Text style={styles.errorSubtext}>
          Please enable microphone permissions in your device settings to play this game.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Title */}
      <Text style={styles.title}>🎤 Voice Shout Game</Text>
      <Text style={styles.subtitle}>SHOUT to brighten the screen!</Text>

      {/* Main visual */}
      <View style={styles.visualContainer}>
        <Animated.View
          style={[
            styles.volumeCircle,
            {
              transform: [{ scale: pulseAnim }],
              backgroundColor: glowAnim.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: ['#1a1a2e', '#ff6b35', '#ffdd00'],
              }),
              shadowOpacity: glowAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.3, 1],
              }),
            },
          ]}
        >
          <Text style={styles.volumeEmoji}>{getVolumeEmoji()}</Text>
        </Animated.View>
        
        <Text style={styles.volumeMessage}>{getVolumeMessage()}</Text>
      </View>

      {/* Volume meter */}
      <View style={styles.meterContainer}>
        <Text style={styles.meterLabel}>Volume</Text>
        <View style={styles.meterBar}>
          <Animated.View
            style={[
              styles.meterFill,
              {
                width: `${currentVolume}%`,
                backgroundColor: glowAnim.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: ['#4a90a4', '#ff6b35', '#ffdd00'],
                }),
              },
            ]}
          />
        </View>
        <Text style={styles.meterValue}>{Math.round(currentVolume)}%</Text>
      </View>

      {/* Brightness display */}
      <View style={styles.brightnessContainer}>
        <Text style={styles.brightnessLabel}>Screen Brightness</Text>
        <View style={styles.brightnessBar}>
          <View style={[styles.brightnessFill, { width: `${brightnessPercent}%` }]} />
        </View>
        <Text style={styles.brightnessValue}>{brightnessPercent}%</Text>
      </View>

      {/* Peak volume */}
      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statEmoji}>🏆</Text>
          <Text style={styles.statLabel}>Peak Volume</Text>
          <Text style={styles.statValue}>{Math.round(peakVolume)}%</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statEmoji}>{isRecording ? '🔴' : '⚫'}</Text>
          <Text style={styles.statLabel}>Status</Text>
          <Text style={styles.statValue}>{isRecording ? 'LIVE' : 'OFF'}</Text>
        </View>
      </View>

      {/* Instructions */}
      <View style={styles.instructionsContainer}>
        <Text style={styles.instructionText}>📢 SHOUT = Brightness UP</Text>
        <Text style={styles.instructionText}>🤫 Silence = Brightness DOWN</Text>
        <Text style={styles.instructionText}>🎯 Try to reach 100% brightness!</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a1a',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#aaa',
    marginBottom: 30,
  },
  visualContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  volumeCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#ffdd00',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 30,
    elevation: 10,
  },
  volumeEmoji: {
    fontSize: 60,
  },
  volumeMessage: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 20,
    textAlign: 'center',
  },
  meterContainer: {
    width: '100%',
    marginBottom: 20,
  },
  meterLabel: {
    fontSize: 14,
    color: '#888',
    marginBottom: 8,
  },
  meterBar: {
    height: 20,
    backgroundColor: '#1a1a2e',
    borderRadius: 10,
    overflow: 'hidden',
  },
  meterFill: {
    height: '100%',
    borderRadius: 10,
  },
  meterValue: {
    fontSize: 14,
    color: '#fff',
    marginTop: 5,
    textAlign: 'right',
  },
  brightnessContainer: {
    width: '100%',
    marginBottom: 30,
  },
  brightnessLabel: {
    fontSize: 14,
    color: '#888',
    marginBottom: 8,
  },
  brightnessBar: {
    height: 20,
    backgroundColor: '#1a1a2e',
    borderRadius: 10,
    overflow: 'hidden',
  },
  brightnessFill: {
    height: '100%',
    backgroundColor: '#f1c40f',
    borderRadius: 10,
  },
  brightnessValue: {
    fontSize: 14,
    color: '#f1c40f',
    marginTop: 5,
    textAlign: 'right',
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 30,
  },
  statBox: {
    backgroundColor: '#1a1a2e',
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    minWidth: 120,
  },
  statEmoji: {
    fontSize: 24,
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 5,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  instructionsContainer: {
    backgroundColor: '#1a1a2e',
    borderRadius: 15,
    padding: 15,
    width: '100%',
  },
  instructionText: {
    fontSize: 14,
    color: '#aaa',
    marginVertical: 3,
    textAlign: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#aaa',
  },
  errorEmoji: {
    fontSize: 60,
    marginBottom: 20,
  },
  errorText: {
    fontSize: 20,
    color: '#e74c3c',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  errorSubtext: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});

export default VoiceShoutGame;
