// Seesaw of Light Game
// Developer: LumenLottery Team
//
// Rules:
// - TILT YOUR PHONE left/right to control the seesaw
// - Balance point = brightness (level = 50%)
// - Seesaw jitters constantly so brightness NEVER stabilizes
// - Tilt left = darker, Tilt right = brighter

import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Dimensions, 
  Animated,
  Easing,
} from 'react-native';
import { Accelerometer } from 'expo-sensors';
import { MinigameProps } from '../types/Minigame';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SEESAW_WIDTH = SCREEN_WIDTH * 0.85;
const SEESAW_HEIGHT = 20;
const PIVOT_SIZE = 40;
const MAX_ANGLE = 30; // Max tilt in degrees

export default function SeesawGame({ onBrightnessChange }: MinigameProps) {
  const [tiltX, setTiltX] = useState(0);
  const [angle, setAngle] = useState(0);
  const [brightness, setBrightness] = useState(0.5);
  const [isAvailable, setIsAvailable] = useState(true);
  
  const seesawRotation = useRef(new Animated.Value(0)).current;
  const jitterInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const smoothedTilt = useRef(0);

  // Set up accelerometer
  useEffect(() => {
    let subscription: { remove: () => void } | null = null;

    const startAccelerometer = async () => {
      const available = await Accelerometer.isAvailableAsync();
      setIsAvailable(available);
      
      if (!available) return;

      // Set update interval (faster = smoother)
      Accelerometer.setUpdateInterval(50);

      subscription = Accelerometer.addListener(({ x }) => {
        // x ranges from -1 (tilted left) to 1 (tilted right)
        setTiltX(x);
      });
    };

    startAccelerometer();

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, []);

  // Smooth the tilt and add physics
  useEffect(() => {
    const physicsInterval = setInterval(() => {
      // Smooth the accelerometer input
      const targetTilt = tiltX * MAX_ANGLE * 1.5; // Amplify for more sensitivity
      const smoothing = 0.15;
      
      smoothedTilt.current += (targetTilt - smoothedTilt.current) * smoothing;
      
      // Clamp angle
      const clampedAngle = Math.max(-MAX_ANGLE, Math.min(MAX_ANGLE, smoothedTilt.current));
      setAngle(clampedAngle);
    }, 16);

    return () => clearInterval(physicsInterval);
  }, [tiltX]);

  // Constant jitter effect - brightness NEVER stabilizes!
  useEffect(() => {
    jitterInterval.current = setInterval(() => {
      // Add random jitter
      const jitter = (Math.random() - 0.5) * 4;
      setAngle(prev => {
        const jittered = prev + jitter;
        return Math.max(-MAX_ANGLE, Math.min(MAX_ANGLE, jittered));
      });
    }, 80);

    return () => {
      if (jitterInterval.current) clearInterval(jitterInterval.current);
    };
  }, []);

  // Update brightness based on angle
  useEffect(() => {
    // Map angle (-MAX_ANGLE to MAX_ANGLE) to brightness (0 to 1)
    const normalizedBrightness = (angle + MAX_ANGLE) / (2 * MAX_ANGLE);
    const clampedBrightness = Math.max(0.05, Math.min(1, normalizedBrightness));
    setBrightness(clampedBrightness);
    onBrightnessChange(clampedBrightness);
  }, [angle, onBrightnessChange]);

  // Animate seesaw rotation
  useEffect(() => {
    Animated.timing(seesawRotation, {
      toValue: angle,
      duration: 50,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start();
  }, [angle, seesawRotation]);

  const rotationInterpolate = seesawRotation.interpolate({
    inputRange: [-MAX_ANGLE, MAX_ANGLE],
    outputRange: [`-${MAX_ANGLE}deg`, `${MAX_ANGLE}deg`],
  });

  // Calculate ball position based on tilt
  const ballPosition = ((angle + MAX_ANGLE) / (2 * MAX_ANGLE)) * (SEESAW_WIDTH - 60);

  if (!isAvailable) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorEmoji}>📱</Text>
          <Text style={styles.errorText}>Accelerometer not available</Text>
          <Text style={styles.errorHint}>This game requires a real device with motion sensors</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Title */}
      <View style={styles.header}>
        <Text style={styles.title}>⚖️ Seesaw of Light</Text>
        <Text style={styles.subtitle}>📱 TILT YOUR PHONE to control brightness!</Text>
      </View>

      {/* Brightness indicator */}
      <View style={styles.brightnessContainer}>
        <Text style={styles.brightnessLabel}>
          💡 {Math.round(brightness * 100)}%
        </Text>
        <View style={styles.brightnessBar}>
          <View style={[styles.brightnessLevel, { width: `${brightness * 100}%` }]} />
        </View>
        <Text style={styles.jitterWarning}>⚠️ Warning: Jitter enabled - Good luck stabilizing!</Text>
      </View>

      {/* Tilt instruction */}
      <View style={styles.tiltInstruction}>
        <Text style={styles.tiltArrow}>◀️ DARK</Text>
        <Text style={styles.tiltCenter}>TILT</Text>
        <Text style={styles.tiltArrow}>BRIGHT ▶️</Text>
      </View>

      {/* Seesaw area */}
      <View style={styles.seesawArea}>
        {/* Pivot */}
        <View style={styles.pivot} />
        
        {/* Seesaw beam */}
        <Animated.View 
          style={[
            styles.seesaw, 
            { transform: [{ rotate: rotationInterpolate }] }
          ]}
        >
          {/* Left label */}
          <Text style={styles.seesawLabel}>🌙</Text>
          
          {/* Rolling ball */}
          <Animated.View
            style={[
              styles.ball,
              { left: ballPosition }
            ]}
          >
            <Text style={styles.ballEmoji}>⚽</Text>
          </Animated.View>
          
          {/* Right label */}
          <Text style={[styles.seesawLabel, styles.seesawLabelRight]}>☀️</Text>
        </Animated.View>
      </View>

      {/* Visual tilt meter */}
      <View style={styles.tiltMeterContainer}>
        <Text style={styles.tiltMeterLabel}>Phone Tilt</Text>
        <View style={styles.tiltMeter}>
          <View style={styles.tiltMeterCenter} />
          <Animated.View 
            style={[
              styles.tiltMeterIndicator,
              { left: `${((tiltX + 1) / 2) * 100}%` }
            ]} 
          />
        </View>
        <View style={styles.tiltMeterLabels}>
          <Text style={styles.tiltMeterSideLabel}>Left</Text>
          <Text style={styles.tiltMeterSideLabel}>Right</Text>
        </View>
      </View>

      {/* Debug info */}
      <View style={styles.debugContainer}>
        <Text style={styles.debugText}>
          Tilt: {tiltX.toFixed(2)} | Angle: {angle.toFixed(1)}°
        </Text>
      </View>

      {/* Fun messages */}
      <View style={styles.messageContainer}>
        {brightness < 0.2 && <Text style={styles.message}>🌑 So dark... can you even see this?</Text>}
        {brightness > 0.8 && <Text style={styles.message}>☀️ MY EYES! THE GOGGLES DO NOTHING!</Text>}
        {brightness >= 0.45 && brightness <= 0.55 && <Text style={styles.message}>😌 Almost balanced... NOPE! *jitter*</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a1a',
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#ffd700',
    fontWeight: 'bold',
  },
  brightnessContainer: {
    alignItems: 'center',
    marginVertical: 15,
    paddingHorizontal: 40,
  },
  brightnessLabel: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffd700',
    marginBottom: 8,
  },
  brightnessBar: {
    width: '100%',
    height: 16,
    backgroundColor: '#333',
    borderRadius: 8,
    overflow: 'hidden',
  },
  brightnessLevel: {
    height: '100%',
    backgroundColor: '#ffd700',
    borderRadius: 8,
  },
  jitterWarning: {
    marginTop: 10,
    fontSize: 12,
    color: '#e74c3c',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  tiltInstruction: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 30,
    marginVertical: 10,
  },
  tiltArrow: {
    fontSize: 14,
    color: '#888',
    fontWeight: 'bold',
  },
  tiltCenter: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  seesawArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  },
  pivot: {
    width: PIVOT_SIZE,
    height: PIVOT_SIZE,
    backgroundColor: '#8b4513',
    transform: [{ rotate: '45deg' }],
    position: 'absolute',
    zIndex: 1,
  },
  seesaw: {
    width: SEESAW_WIDTH,
    height: SEESAW_HEIGHT,
    backgroundColor: '#654321',
    borderRadius: 4,
    position: 'relative',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  seesawLabel: {
    position: 'absolute',
    left: 10,
    fontSize: 24,
  },
  seesawLabelRight: {
    left: 'auto',
    right: 10,
  },
  ball: {
    position: 'absolute',
    width: 50,
    height: 50,
    top: -55,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ballEmoji: {
    fontSize: 40,
  },
  tiltMeterContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 40,
  },
  tiltMeterLabel: {
    fontSize: 14,
    color: '#888',
    marginBottom: 8,
  },
  tiltMeter: {
    width: '100%',
    height: 8,
    backgroundColor: '#333',
    borderRadius: 4,
    position: 'relative',
  },
  tiltMeterCenter: {
    position: 'absolute',
    left: '50%',
    top: -4,
    width: 2,
    height: 16,
    backgroundColor: '#666',
    marginLeft: -1,
  },
  tiltMeterIndicator: {
    position: 'absolute',
    top: -6,
    width: 20,
    height: 20,
    backgroundColor: '#3498db',
    borderRadius: 10,
    marginLeft: -10,
  },
  tiltMeterLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 4,
  },
  tiltMeterSideLabel: {
    fontSize: 10,
    color: '#555',
  },
  debugContainer: {
    position: 'absolute',
    bottom: 100,
    left: 20,
  },
  debugText: {
    fontSize: 11,
    color: '#444',
    fontFamily: 'monospace',
  },
  messageContainer: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  message: {
    fontSize: 14,
    color: '#ffd700',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
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
  errorHint: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },
});
