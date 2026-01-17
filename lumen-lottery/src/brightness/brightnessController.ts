// Brightness Controller - Core System
// This file handles all brightness operations. NEVER call Brightness APIs directly from minigames!

import * as Brightness from 'expo-brightness';

let savedBrightness: number | null = null;

/**
 * Save the user's current brightness before starting any game
 * Call this when the app mounts
 */
export async function saveBrightness(): Promise<void> {
  savedBrightness = await Brightness.getBrightnessAsync();
}

/**
 * Set brightness level (0.05 to 1.0)
 * @param value - Brightness value between 0 and 1
 */
export async function setBrightness(value: number): Promise<void> {
  // Never allow brightness below 0.05 (safety measure)
  const clamped = Math.max(0.05, Math.min(1, value));
  await Brightness.setBrightnessAsync(clamped);
}

/**
 * Restore the user's original brightness
 * Call this when exiting any game or unmounting the app
 */
export async function restoreBrightness(): Promise<void> {
  if (savedBrightness !== null) {
    await Brightness.setBrightnessAsync(savedBrightness);
  }
}

/**
 * Get current brightness level
 */
export async function getCurrentBrightness(): Promise<number> {
  return await Brightness.getBrightnessAsync();
}
