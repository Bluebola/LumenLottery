# 🎮 Minigames Development Guide

## How to Create a New Minigame

### 1. Create Your File
Create a new file in `src/minigames/` named `YourGameName.tsx`

### 2. Use This Template
```tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MinigameProps } from '../types/Minigame';

export default function YourGameName({ onBrightnessChange, onExit }: MinigameProps) {
  // Your game state here
  const [gameState, setGameState] = useState(/* initial state */);

  // Example: Change brightness when something happens
  const handleSomething = () => {
    const newBrightness = 0.5; // Calculate based on game logic
    onBrightnessChange(newBrightness); // Value between 0 and 1
  };

  return (
    <View style={styles.container}>
      {/* Your game UI here */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
});
```

### 3. Register Your Game
Add your game to `GameScreen.tsx`:
```tsx
import YourGameName from '../minigames/YourGameName';

// In the switch statement:
case 'yourgame':
  return <YourGameName {...props} />;
```

Add to `HomeScreen.tsx` MINIGAMES array:
```tsx
{
  id: 'yourgame',
  name: 'Your Game',
  emoji: '🎯',
  description: 'What makes it control brightness',
  developer: 'Your Name',
}
```

## ⚠️ RULES

1. **NEVER import expo-brightness directly** - Use `onBrightnessChange(value)` only
2. **Value must be 0-1** - The controller will clamp it for safety
3. **Make it USELESS** - The less practical, the better!
4. **Add your name** - Credit yourself in the developer field

## 💡 Brightness Mapping Ideas

- Game score → brightness
- Character position → brightness
- Time elapsed → brightness
- Random events → brightness
- Failed attempts → brightness (gets darker!)
- Combo multiplier → brightness

## 🎪 UX Sabotage Ideas (Optional but encouraged)

- Random flickers
- Inverted controls
- Fake loading screens
- Unnecessary confirmation dialogs
- Announcer voice that mocks the user
- Progress bars that go backwards
