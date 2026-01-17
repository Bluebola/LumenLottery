// Clap-to-Brighten Game
// Listen for loudness over 15 seconds and map to brightness

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
// @ts-ignore Expo provides this module at runtime; typings may be missing in bare lint
import { Audio } from 'expo-av';
import { MinigameProps } from '../types/Minigame';

const SAMPLE_WINDOW_MS = 15000;
const POLL_MS = 200;
const MIN_BRIGHTNESS = 0.05;

const recordingOptions: Audio.RecordingOptions = {
  isMeteringEnabled: true,
  android: {
    extension: '.m4a',
    outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_MPEG_4,
    audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_AAC,
    sampleRate: 44100,
    numberOfChannels: 1,
    bitRate: 128000,
    maxFileSize: 1024 * 1024,
  },
  ios: {
    extension: '.m4a',
    audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_HIGH,
    sampleRate: 44100,
    numberOfChannels: 1,
    bitRate: 128000,
    linearPCMBitDepth: 16,
    linearPCMIsBigEndian: false,
    linearPCMIsFloat: false,
  },
  web: {
    mimeType: 'audio/webm',
    bitsPerSecond: 128000,
  },
};

function mapDbToBrightness(db: number): number {
  // Typical metering ranges from about -60 dB (quiet) to 0 dB (loud)
  const normalized = Math.max(0, Math.min(1, (db + 60) / 60));
  return MIN_BRIGHTNESS + normalized * (1 - MIN_BRIGHTNESS);
}

export default function ClapToBrightenGame({ onBrightnessChange, onExit }: MinigameProps) {
  const [permission, setPermission] = useState<'pending' | 'granted' | 'denied'>('pending');
  const [isListening, setIsListening] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [peakDb, setPeakDb] = useState(-120);
  const [avgDb, setAvgDb] = useState(-120);
  const [error, setError] = useState<string | null>(null);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startRef = useRef<number | null>(null);
  const sumRef = useRef<number>(0);
  const samplesRef = useRef<number>(0);

  const brightness = useMemo(() => mapDbToBrightness(Math.max(peakDb, avgDb)), [peakDb, avgDb]);

  useEffect(() => {
    async function prepare() {
      try {
        const { status } = await Audio.requestPermissionsAsync();
        if (status !== 'granted') {
          setPermission('denied');
          setError('Microphone permission denied.');
          return;
        }
        setPermission('granted');
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
        });
        await startRecording();
      } catch (e) {
        setError('Failed to start microphone.');
      }
    }
    prepare();

    return () => {
      stopRecording();
    };
  }, []);

  useEffect(() => {
    if (!isListening) return undefined;
    onBrightnessChange(brightness);
    return undefined;
  }, [brightness, isListening, onBrightnessChange]);

  useEffect(() => {
    if (!isListening) return undefined;
    const tick = setInterval(() => {
      const now = Date.now();
      if (startRef.current) {
        const elapsedMs = now - startRef.current;
        setElapsed(Math.min(SAMPLE_WINDOW_MS, elapsedMs));
        if (elapsedMs >= SAMPLE_WINDOW_MS) {
          finalize();
        }
      }
    }, 200);
    return () => clearInterval(tick);
  }, [isListening]);

  async function startRecording() {
    try {
      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(recordingOptions);
      await recording.startAsync();
      startRef.current = Date.now();
      recordingRef.current = recording;
      setIsListening(true);
      pollRef.current = setInterval(async () => {
        const status = await recording.getStatusAsync();
        if (!status.isRecording) return;
        if (status.metering === undefined) return;
        const db = status.metering; // dBFS, negative values
        setPeakDb((prev) => Math.max(prev, db));
        sumRef.current += db;
        samplesRef.current += 1;
        setAvgDb(sumRef.current / samplesRef.current);
      }, POLL_MS);
    } catch (e) {
      setError('Could not access microphone.');
      setIsListening(false);
    }
  }

  async function stopRecording() {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
    const rec = recordingRef.current;
    if (rec) {
      try {
        const status = await rec.getStatusAsync();
        if (status.isRecording) {
          await rec.stopAndUnloadAsync();
        }
      } catch (e) {
        // ignore
      }
    }
    recordingRef.current = null;
    setIsListening(false);
  }

  async function finalize() {
    await stopRecording();
    onBrightnessChange(brightness);
  }

  const remainingSeconds = Math.max(0, Math.ceil((SAMPLE_WINDOW_MS - elapsed) / 1000));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onExit} style={styles.exitButton}>
          <Text style={styles.exitText}>Exit</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Clap-to-Brighten</Text>
        <Text style={styles.timer}>{remainingSeconds}s</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.subtitle}>Make noise for 15 seconds</Text>
        {permission === 'pending' && <ActivityIndicator color="#ffd54f" />}
        {permission === 'denied' && <Text style={styles.errorText}>Microphone permission is required.</Text>}
        {error && <Text style={styles.errorText}>{error}</Text>}

        <View style={styles.meterRow}>
          <Text style={styles.meterLabel}>Peak</Text>
          <Text style={styles.meterValue}>{peakDb.toFixed(1)} dB</Text>
        </View>
        <View style={styles.barOuter}>
          <View style={[styles.barInner, { width: `${mapDbToBrightness(peakDb) * 100}%` }]} />
        </View>

        <View style={styles.meterRow}>
          <Text style={styles.meterLabel}>Average</Text>
          <Text style={styles.meterValue}>{avgDb.toFixed(1)} dB</Text>
        </View>
        <View style={styles.barOuter}>
          <View style={[styles.barInner, { width: `${mapDbToBrightness(avgDb) * 100}%` }]} />
        </View>

        <View style={styles.brightnessRow}>
          <Text style={styles.brightnessLabel}>Brightness target</Text>
          <Text style={styles.brightnessValue}>{Math.round(brightness * 100)}%</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.helper}>We sample loudness for 15s. The louder your peak/average, the brighter the screen will stay.</Text>
        <TouchableOpacity onPress={finalize} style={styles.primaryButton} disabled={!isListening}>
          <Text style={styles.primaryButtonText}>Finish Now</Text>
        </TouchableOpacity>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
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
  title: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  timer: {
    color: '#ffd54f',
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: '#16213e',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#23345f',
  },
  subtitle: {
    color: '#b7c8e8',
    fontSize: 16,
    marginBottom: 12,
    textAlign: 'center',
  },
  meterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  meterLabel: {
    color: '#7f9cc4',
    fontSize: 13,
  },
  meterValue: {
    color: '#fff',
    fontWeight: 'bold',
  },
  barOuter: {
    height: 10,
    borderRadius: 6,
    backgroundColor: '#0d1630',
    marginTop: 6,
    overflow: 'hidden',
  },
  barInner: {
    height: '100%',
    backgroundColor: '#ffd54f',
  },
  brightnessRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  brightnessLabel: {
    color: '#7f9cc4',
  },
  brightnessValue: {
    color: '#7bed8d',
    fontWeight: 'bold',
    fontSize: 18,
  },
  footer: {
    marginTop: 16,
  },
  helper: {
    color: '#7f9cc4',
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 12,
  },
  primaryButton: {
    backgroundColor: '#ffd54f',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    opacity: 1,
  },
  primaryButtonText: {
    color: '#0f0f23',
    fontWeight: 'bold',
    fontSize: 16,
  },
  errorText: {
    color: '#ff7b7b',
    marginTop: 8,
  },
});
