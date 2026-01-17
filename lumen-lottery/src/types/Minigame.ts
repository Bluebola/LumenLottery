// Minigame Interface Contract
// ALL minigames MUST implement this interface!

export interface MinigameProps {
  /**
   * Callback to change brightness
   * @param value - A number between 0 and 1 (will be clamped by brightnessController)
   * 
   * IMPORTANT: Never import expo-brightness directly in your minigame!
   * Just call this function with a value from 0 to 1.
   */
  onBrightnessChange: (value: number) => void;

  /**
   * Callback to exit the minigame and return to home screen
   */
  onExit: () => void;
}

/**
 * Minigame metadata for the home screen
 */
export interface MinigameInfo {
  id: string;
  name: string;
  description: string;
  icon: string; // emoji or icon name
  developer: string; // Your name! For credit
}
