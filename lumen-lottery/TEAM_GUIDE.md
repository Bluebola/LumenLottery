# 🔆 Lumen Lottery - Team Development Guide

## Welcome to the Most Useless Hackathon Project Ever!

This guide will help you and your teammates work together on this gloriously pointless brightness-controlling app.

---

## 📋 Quick Start for New Team Members

### Step 1: Clone the Repository
```bash
git clone https://github.com/Bluebola/LumenLottery.git
cd LumenLottery/lumen-lottery
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Install Navigation (if not already done)
```bash
npx expo install @react-navigation/native @react-navigation/native-stack react-native-screens react-native-safe-area-context
```

### Step 4: Start the App
```bash
npm start
```

Then scan the QR code with Expo Go app on your phone.

---

## 🌿 Git Workflow (SUPER IMPORTANT!)

### Golden Rules
1. **NEVER push directly to `main`** - Always use branches
2. **Pull before you push** - Always get latest changes first
3. **One feature per branch** - Keep changes focused
4. **Communicate!** - Tell the team what you're working on

### Daily Workflow

#### Before Starting Work
```bash
# Make sure you're on main
git checkout main

# Get the latest changes
git pull origin main

# Create your feature branch
git checkout -b your-name/feature-name
# Example: git checkout -b alex/snake-game
```

#### While Working
```bash
# Save your work frequently
git add .
git commit -m "Description of what you did"

# Example commit messages:
# "Add snake movement logic"
# "Fix brightness not updating on collision"
# "Style the slot machine reels"
```

#### When Done with a Feature
```bash
# Push your branch
git push origin your-name/feature-name

# Then go to GitHub and create a Pull Request!
```

### If You Get Conflicts
```bash
# First, save your current work
git stash

# Get latest main
git checkout main
git pull origin main

# Go back to your branch
git checkout your-name/feature-name

# Apply latest main to your branch
git rebase main

# If there are conflicts, fix them in VS Code, then:
git add .
git rebase --continue

# Get your saved work back
git stash pop
```

---

## 📁 Project Structure

```
src/
├── brightness/
│   └── brightnessController.ts  ← DON'T TOUCH (handles all brightness)
├── minigames/
│   ├── SnakeGame.tsx           ← Team Member 1
│   ├── SeesawGame.tsx          ← Team Member 2
│   ├── SlotMachineGame.tsx     ← Team Member 3
│   └── [YourNewGame].tsx       ← Add more games here!
├── screens/
│   ├── HomeScreen.tsx          ← Game selection menu
│   └── GameScreen.tsx          ← Hosts minigames
├── navigation/
│   └── AppNavigator.tsx        ← Screen navigation
├── components/
│   └── GameContainer.tsx       ← Shared game wrapper
└── types/
    └── Minigame.ts             ← TypeScript interfaces
```

---

## 👥 Task Division Suggestions

### Person 1: Snake Game
- Files: `src/minigames/SnakeGame.tsx`
- Task: Implement snake that controls brightness based on length
- Branch: `person1/snake-game`

### Person 2: Seesaw Game  
- Files: `src/minigames/SeesawGame.tsx`
- Task: Implement tilting seesaw that controls brightness
- Branch: `person2/seesaw-game`

### Person 3: Slot Machine
- Files: `src/minigames/SlotMachineGame.tsx`
- Task: Implement slot machine with random brightness outcomes
- Branch: `person3/slot-machine`

### Person 4: Navigation & Polish
- Files: `AppNavigator.tsx`, `HomeScreen.tsx`, `GameScreen.tsx`
- Task: Set up navigation, styling, demo mode
- Branch: `person4/navigation-polish`

---

## 🎮 How to Create Your Minigame

### The Only Rule
**NEVER import expo-brightness directly!**

Instead, use the `onBrightnessChange` callback:

```tsx
// ❌ WRONG - Don't do this!
import * as Brightness from 'expo-brightness';
Brightness.setBrightnessAsync(0.5);

// ✅ CORRECT - Do this!
onBrightnessChange(0.5);
```

### Template
See `src/minigames/README.md` for a full template.

### Registering Your Game
1. Import in `GameScreen.tsx`
2. Add case in the switch statement
3. Add to MINIGAMES array in `HomeScreen.tsx`

---

## 🔧 Common Commands

```bash
# Start development server
npm start

# Clear cache if things break
npx expo start --clear

# Install a new package
npx expo install package-name

# Check for errors
npm run lint
```

---

## 🆘 Troubleshooting

### "Module not found"
```bash
npm install
npx expo start --clear
```

### "Brightness not changing"
- Are you on a real device? Brightness won't change in simulator
- Did you use `onBrightnessChange()` instead of direct API?

### "Git says I have conflicts"
- Don't panic!
- Open the conflicting files in VS Code
- Look for `<<<<<<<` markers
- Choose which code to keep
- Save, then `git add .` and `git commit`

### "App crashes on start"
```bash
# Reset everything
rm -rf node_modules
npm install
npx expo start --clear
```

---

## 📱 Testing

### For Real Brightness Testing
You MUST use a real device (not simulator):
1. Install Expo Go on your phone
2. Scan the QR code from `npm start`
3. Brightness changes will actually work!

### Demo Mode (TODO)
For the hackathon demo, we need an autoplay mode that shows off all games quickly.

---

## 🏆 Hackathon Checklist

- [ ] At least 3 minigames working
- [ ] Brightness actually changes on real device
- [ ] Reset brightness button works
- [ ] App doesn't crash
- [ ] App doesn't permanently blind users (brightness >= 5%)
- [ ] Demo mode for presentation

---

## 💬 Communication

- Tell the team when you start working on something
- Tell the team when you push changes
- Ask for help early - don't struggle alone!
- Review each other's pull requests

---

## 🎯 Remember the Goal

This is for the "Most Useless Hack" award. The app should be:
- ✅ Technically impressive (real native APIs!)
- ✅ Completely impractical
- ✅ Frustrating to use
- ✅ Hilarious

Good luck, and may your screen brightness be forever unstable! 🔆
