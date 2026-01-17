import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Accelerometer, Gyroscope } from 'expo-sensors';
import { MinigameProps } from '../types/Minigame';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Combines accelerometer + gyroscope for better motion detection
// Detects both phone movement AND rotation (which happens when you move)
const FreezeFrameGame: React.FC<MinigameProps> = ({ onBrightnessChange }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [brightness, setBrightness] = useState(0.5);
  const [motionLevel, setMotionLevel] = useState(0);
  const [isStill, setIsStill] = useState(false);
  const [stillTime, setStillTime] = useState(0);
  const [status, setStatus] = useState<'detecting' | 'still' | 'moving'>('detecting');
  
  const lastAccelRef = useRef({ x: 0, y: 0, z: 0 });
  const lastGyroRef = useRef({ x: 0, y: 0, z: 0 });
  const motionHistoryRef = useRef<number[]>([]);
  const stillTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const combinedMotionRef = useRef(0);
  
  // HIGH THRESHOLD - very forgiving for hand tremors when holding phone
  const MOTION_THRESHOLD = 0.06; // Increased significantly - allows normal hand shake
  const BRIGHTNESS_DECAY = 0.03; // Decay rate when moving
  const BRIGHTNESS_GAIN = 0.015; // Gain rate when still

  // Request camera permission on mount
  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  // Combined Accelerometer + Gyroscope motion detection
  useEffect(() => {
    Accelerometer.setUpdateInterval(100); // Slower updates = less jitter (10 Hz)
    Gyroscope.setUpdateInterval(100);
    
    // Track accelerometer changes
    const accelSubscription = Accelerometer.addListener((data) => {
      const { x, y, z } = data;
      const last = lastAccelRef.current;
      
      // Calculate motion as change in acceleration
      const deltaX = Math.abs(x - last.x);
      const deltaY = Math.abs(y - last.y);
      const deltaZ = Math.abs(z - last.z);
      const accelMotion = deltaX + deltaY + deltaZ;
      
      // Store for combined calculation
      lastAccelRef.current = { x, y, z };
      
      // Combine with gyroscope motion
      const gyroMotion = combinedMotionRef.current;
      const totalMotion = accelMotion * 0.5 + gyroMotion * 0.5;
      
      // Update history for heavy smoothing (10 samples)
      motionHistoryRef.current.push(totalMotion);
      if (motionHistoryRef.current.length > 10) {
        motionHistoryRef.current.shift();
      }
      
      // Average motion over recent samples for stability
      const avgMotion = motionHistoryRef.current.reduce((a, b) => a + b, 0) / motionHistoryRef.current.length;
      
      // Normalize to 0-100 scale for display (adjusted for new threshold)
      const normalizedMotion = Math.min(100, avgMotion * 300);
      setMotionLevel(normalizedMotion);
      
      // Determine if still (with new higher threshold)
      const currentlyStill = avgMotion < MOTION_THRESHOLD;
      setIsStill(currentlyStill);
      setStatus(currentlyStill ? 'still' : 'moving');
      
      // Update brightness based on motion
      setBrightness(prev => {
        let newBrightness = prev;
        
        if (currentlyStill) {
          // Increase brightness when still
          newBrightness = Math.min(1, prev + BRIGHTNESS_GAIN);
        } else {
          // Decrease brightness when moving (proportional to motion)
          const decayAmount = BRIGHTNESS_DECAY * (1 + avgMotion * 5);
          newBrightness = Math.max(0.05, prev - decayAmount);
        }
        
        onBrightnessChange(newBrightness);
        return newBrightness;
      });
    });
    
    // Track gyroscope for rotation detection (catches subtle movements)
    const gyroSubscription = Gyroscope.addListener((data) => {
      const { x, y, z } = data;
      const last = lastGyroRef.current;
      
      // Calculate rotational motion
      const deltaX = Math.abs(x - last.x);
      const deltaY = Math.abs(y - last.y);
      const deltaZ = Math.abs(z - last.z);
      const gyroMotion = deltaX + deltaY + deltaZ;
      
      combinedMotionRef.current = gyroMotion;
      lastGyroRef.current = { x, y, z };
    });

    return () => {
      accelSubscription.remove();
      gyroSubscription.remove();
      if (stillTimerRef.current) {
        clearInterval(stillTimerRef.current);
      }
    };
  }, [onBrightnessChange]);

  // Track how long user stays still
  useEffect(() => {
    if (isStill) {
      stillTimerRef.current = setInterval(() => {
        setStillTime(prev => prev + 0.1);
      }, 100);
    } else {
      if (stillTimerRef.current) {
        clearInterval(stillTimerRef.current);
      }
      setStillTime(0);
    }

    return () => {
      if (stillTimerRef.current) {
        clearInterval(stillTimerRef.current);
      }
    };
  }, [isStill]);

  const brightnessPercent = Math.round(brightness * 100);

  const getStatusEmoji = () => {
    if (status === 'still') return '🧊';
    if (status === 'moving') return '💨';
    return '👁️';
  };

  const getStatusMessage = () => {
    if (status === 'still') {
      if (stillTime > 3) return 'FROZEN SOLID! 🏆';
      if (stillTime > 1) return 'Stay still...';
      return 'Good, hold it!';
    }
    if (status === 'moving') return 'MOVEMENT DETECTED!';
    return 'Detecting...';
  };

  if (!permission) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorEmoji}>📷❌</Text>
        <Text style={styles.errorText}>Camera access denied!</Text>
        <Text style={styles.errorSubtext}>
          This game uses the camera to detect motion. Please enable camera permissions.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Title */}
      <Text style={styles.title}>🧊 Freeze Frame</Text>
      <Text style={styles.subtitle}>Stay PERFECTLY still and keep your phone still to brighten your screen!</Text>

      {/* Camera Preview */}
      <View style={styles.cameraContainer}>
        <CameraView
          style={styles.camera}
          facing="front"
        />
        <View style={styles.cameraOverlay}>
          <View style={[
            styles.motionIndicator,
            { backgroundColor: isStill ? '#2ecc71' : '#e74c3c' }
          ]}>
            <Text style={styles.motionIndicatorText}>
              {isStill ? 'STILL' : 'MOVING'}
            </Text>
          </View>
        </View>
      </View>

      {/* Status Display */}
      <View style={styles.statusContainer}>
        <Text style={styles.statusEmoji}>{getStatusEmoji()}</Text>
        <Text style={[
          styles.statusMessage,
          { color: isStill ? '#2ecc71' : '#e74c3c' }
        ]}>
          {getStatusMessage()}
        </Text>
        {isStill && stillTime > 0 && (
          <Text style={styles.stillTimer}>{stillTime.toFixed(1)}s frozen</Text>
        )}
      </View>

      {/* Motion Meter */}
      <View style={styles.meterContainer}>
        <Text style={styles.meterLabel}>Motion Level</Text>
        <View style={styles.meterBar}>
          <View
            style={[
              styles.meterFill,
              {
                width: `${Math.min(100, motionLevel)}%`,
                backgroundColor: motionLevel < 20 ? '#2ecc71' : motionLevel < 50 ? '#f39c12' : '#e74c3c',
              },
            ]}
          />
        </View>
        <Text style={styles.meterValue}>{Math.round(motionLevel)}%</Text>
      </View>

      {/* Brightness Display */}
      <View style={styles.brightnessContainer}>
        <Text style={styles.brightnessLabel}>Screen Brightness</Text>
        <View style={styles.brightnessBar}>
          <View style={[styles.brightnessFill, { width: `${brightnessPercent}%` }]} />
        </View>
        <Text style={styles.brightnessValue}>{brightnessPercent}%</Text>
      </View>

      {/* Instructions */}
      <View style={styles.instructionsContainer}>
        <Text style={styles.instructionText}>🧊 Stay still = Brightness UP</Text>
        <Text style={styles.instructionText}>💨 Move = Brightness DOWN</Text>
        <Text style={styles.instructionText}>🎯 Hold your body and phone still for 100% brightness!</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a1a',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 10,
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#aaa',
    marginBottom: 15,
  },
  cameraContainer: {
    width: SCREEN_WIDTH - 60,
    height: 200,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 15,
    borderWidth: 3,
    borderColor: '#1a1a2e',
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 10,
  },
  motionIndicator: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  motionIndicatorText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  statusContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  statusEmoji: {
    fontSize: 50,
    marginBottom: 8,
  },
  statusMessage: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  stillTimer: {
    fontSize: 14,
    color: '#2ecc71',
    marginTop: 4,
  },
  meterContainer: {
    width: '100%',
    marginBottom: 15,
  },
  meterLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 6,
  },
  meterBar: {
    height: 16,
    backgroundColor: '#1a1a2e',
    borderRadius: 8,
    overflow: 'hidden',
  },
  meterFill: {
    height: '100%',
    borderRadius: 8,
  },
  meterValue: {
    fontSize: 12,
    color: '#fff',
    marginTop: 4,
    textAlign: 'right',
  },
  brightnessContainer: {
    width: '100%',
    marginBottom: 20,
  },
  brightnessLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 6,
  },
  brightnessBar: {
    height: 16,
    backgroundColor: '#1a1a2e',
    borderRadius: 8,
    overflow: 'hidden',
  },
  brightnessFill: {
    height: '100%',
    backgroundColor: '#f1c40f',
    borderRadius: 8,
  },
  brightnessValue: {
    fontSize: 12,
    color: '#f1c40f',
    marginTop: 4,
    textAlign: 'right',
    fontWeight: 'bold',
  },
  instructionsContainer: {
    backgroundColor: '#1a1a2e',
    borderRadius: 15,
    padding: 15,
    width: '100%',
  },
  instructionText: {
    fontSize: 13,
    color: '#aaa',
    marginVertical: 3,
    textAlign: 'center',
  },
  loadingText: {
    fontSize: 16,
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

export default FreezeFrameGame;
