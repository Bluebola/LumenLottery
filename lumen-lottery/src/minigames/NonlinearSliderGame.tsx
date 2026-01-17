// Nonlinear Slider Game
// First 90% does nothing, last 10% = retina burn

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, PanResponder, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MinigameProps } from '../types/Minigame';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SLIDER_WIDTH = SCREEN_WIDTH - 80;
const THUMB_SIZE = 40;
const DANGER_ZONE_START = 0.9; // Last 10% is the danger zone

export default function NonlinearSliderGame({ onBrightnessChange, onExit }: MinigameProps) {
  const [sliderValue, setSliderValue] = useState(0);
  const [brightness, setBrightness] = useState(0.05);
  const thumbPosition = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  
  // Calculate brightness from slider position (nonlinear!)
  const calculateBrightness = (value: number): number => {
    if (value < DANGER_ZONE_START) {
      // First 90%: stays at minimum brightness (0.05)
      return 0.05;
    } else {
      // Last 10%: exponential ramp from 0.05 to 1.0
      const normalizedValue = (value - DANGER_ZONE_START) / (1 - DANGER_ZONE_START);
      // Exponential curve for extra dramatic effect
      const exponential = Math.pow(normalizedValue, 2);
      return 0.05 + (0.95 * exponential);
    }
  };
  
  // Track if we're in danger zone
  const isInDangerZone = sliderValue >= DANGER_ZONE_START;
  
  // Pulsing animation when in danger zone
  useEffect(() => {
    if (isInDangerZone) {
      const intensity = (sliderValue - DANGER_ZONE_START) / (1 - DANGER_ZONE_START);
      const duration = Math.max(100, 500 - (intensity * 400)); // Faster pulse as you go higher
      
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.3,
            duration: duration,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: duration,
            useNativeDriver: true,
          }),
        ])
      );
      animation.start();
      return () => animation.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isInDangerZone, sliderValue, pulseAnim]);
  
  // Update brightness when slider changes
  useEffect(() => {
    const newBrightness = calculateBrightness(sliderValue);
    setBrightness(newBrightness);
    onBrightnessChange(newBrightness);
  }, [sliderValue, onBrightnessChange]);
  
  // Pan responder for slider control
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        const touchX = evt.nativeEvent.locationX;
        const newValue = Math.max(0, Math.min(1, touchX / SLIDER_WIDTH));
        setSliderValue(newValue);
        thumbPosition.setValue(newValue * SLIDER_WIDTH);
      },
      onPanResponderMove: (evt, gestureState) => {
        const currentPos = gestureState.moveX - 40; // Account for container padding
        const newValue = Math.max(0, Math.min(1, currentPos / SLIDER_WIDTH));
        setSliderValue(newValue);
        thumbPosition.setValue(newValue * SLIDER_WIDTH);
      },
    })
  ).current;
  
  const dangerProgress = isInDangerZone
    ? ((sliderValue - DANGER_ZONE_START) / (1 - DANGER_ZONE_START)) * 100 
    : 0;
  
  return (
    <View style={styles.container}>
      {/* Warning overlay when in danger zone */}
      {isInDangerZone && (
        <Animated.View 
          style={[
            styles.warningOverlay, 
            { 
              opacity: pulseAnim.interpolate({
                inputRange: [1, 1.3],
                outputRange: [0.3, 0.6]
              }),
              backgroundColor: `rgba(255, ${Math.floor(100 - dangerProgress)}, 0, 0.3)`
            }
          ]} 
        />
      )}
      
      <Animated.Text 
        style={[
          styles.emoji, 
          isInDangerZone && { transform: [{ scale: pulseAnim }] }
        ]}
      >
        {isInDangerZone ? '🔥' : '📈'}
      </Animated.Text>
      
      <Text style={styles.title}>Nonlinear Slider</Text>
      
      <Text style={[styles.subtitle, isInDangerZone && styles.dangerText]}>
        {isInDangerZone 
          ? `⚠️ DANGER ZONE: ${dangerProgress.toFixed(0)}%` 
          : 'Nothing happens here... keep sliding →'}
      </Text>
      
      {/* Slider track */}
      <View style={styles.sliderContainer} {...panResponder.panHandlers}>
        <LinearGradient
          colors={['#333', '#333', '#ff6600', '#ff0000']}
          locations={[0, 0.9, 0.95, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.sliderTrack}
        >
          {/* Danger zone marker */}
          <View style={styles.dangerZoneMarker}>
            <Text style={styles.dangerZoneText}>⚡</Text>
          </View>
        </LinearGradient>
        
        {/* Slider thumb */}
        <Animated.View
          style={[
            styles.thumb,
            {
              backgroundColor: isInDangerZone ? '#ff4444' : '#ffd700',
              transform: [
                { translateX: thumbPosition },
                ...(isInDangerZone ? [{ scale: pulseAnim }] : []),
              ],
            },
          ]}
        >
          <Text style={styles.thumbText}>{isInDangerZone ? '☀️' : '🌙'}</Text>
        </Animated.View>
      </View>
      
      {/* Progress labels */}
      <View style={styles.labelsContainer}>
        <Text style={styles.label}>0%</Text>
        <Text style={[styles.label, styles.dangerLabel]}>90%</Text>
        <Text style={styles.label}>100%</Text>
      </View>
      
      {/* Brightness display */}
      <View style={styles.brightnessDisplay}>
        <Text style={styles.brightnessLabel}>Brightness</Text>
        <Text style={[styles.brightnessValue, isInDangerZone && styles.dangerValue]}>
          {Math.round(brightness * 100)}%
        </Text>
      </View>
      
      {/* Slider position */}
      <Text style={styles.sliderPosition}>
        Slider: {Math.round(sliderValue * 100)}%
      </Text>
      
      <Text style={styles.hint}>
        {isInDangerZone 
          ? '🔥 RETINA BURN MODE ACTIVATED 🔥' 
          : 'First 90% does nothing...\nAll the fun is in the last 10%'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: '#1a1a2e',
    padding: 20,
  },
  warningOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  emoji: { 
    fontSize: 80, 
    marginBottom: 20,
  },
  title: { 
    fontSize: 32, 
    fontWeight: 'bold', 
    color: '#fff', 
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    marginBottom: 40,
    textAlign: 'center',
  },
  dangerText: {
    color: '#ff6600',
    fontWeight: 'bold',
  },
  sliderContainer: {
    width: SLIDER_WIDTH,
    height: 60,
    justifyContent: 'center',
    marginBottom: 10,
  },
  sliderTrack: {
    width: '100%',
    height: 20,
    borderRadius: 10,
    position: 'relative',
  },
  dangerZoneMarker: {
    position: 'absolute',
    left: '90%',
    top: -25,
    transform: [{ translateX: -10 }],
  },
  dangerZoneText: {
    fontSize: 20,
  },
  thumb: {
    position: 'absolute',
    left: -THUMB_SIZE / 2, // Offset so thumb centers on track position
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#ffd700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
    top: 10,
  },
  thumbText: {
    fontSize: 20,
  },
  labelsContainer: {
    flexDirection: 'row',
    width: SLIDER_WIDTH,
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  label: {
    color: '#666',
    fontSize: 12,
  },
  dangerLabel: {
    color: '#ff6600',
    fontWeight: 'bold',
  },
  brightnessDisplay: {
    alignItems: 'center',
    marginBottom: 20,
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 15,
    minWidth: 150,
  },
  brightnessLabel: {
    color: '#888',
    fontSize: 14,
    marginBottom: 5,
  },
  brightnessValue: {
    color: '#ffd700',
    fontSize: 48,
    fontWeight: 'bold',
  },
  dangerValue: {
    color: '#ff4444',
  },
  sliderPosition: {
    color: '#555',
    fontSize: 12,
    marginBottom: 20,
  },
  hint: { 
    fontSize: 14, 
    color: '#888', 
    textAlign: 'center', 
    lineHeight: 22,
  },
});
