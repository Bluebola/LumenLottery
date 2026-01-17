import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';

// Game categories with all games
const GAME_CATEGORIES = [
  {
    title: '🎮 Game-Based',
    subtitle: 'Skills you never asked for',
    games: [
      { id: 'snake', name: 'Snake', emoji: '🐍', desc: 'Snake length = brightness', color: '#2ecc71' },
      { id: 'flappy', name: 'Flappy Bright', emoji: '🐦', desc: 'Pipes passed = +5% brightness', color: '#3498db' },
      { id: 'tetris', name: 'Tetris Lux', emoji: '🧱', desc: 'Stack height = brightness', color: '#9b59b6' },
      { id: 'pong', name: 'Pong the Sun', emoji: '🏓', desc: 'Ball height = brightness', color: '#e67e22' },
    ]
  },
  {
    title: '⚖️ Physics & "Why?"',
    subtitle: 'Unnecessarily complicated',
    games: [
      { id: 'seesaw', name: 'Seesaw of Light', emoji: '⚖️', desc: 'Balance point = brightness', color: '#1abc9c' },
      { id: 'ballinbox', name: 'Ball-in-a-Box', emoji: '📦', desc: 'Tilt to control brightness', color: '#e74c3c' },
      { id: 'pendulum', name: 'Pendulum Dimmer', emoji: '🎯', desc: 'Sample brightness at lowest point', color: '#f39c12' },
    ]
  },
  {
    title: '🎰 Random & Luck',
    subtitle: 'Zero control over your fate',
    games: [
      { id: 'slots', name: 'Slot Machine Lux', emoji: '🎰', desc: '3 suns = max, 3 moons = dark', color: '#8e44ad' },
      { id: 'roulette', name: 'Roulette Wheel', emoji: '🎡', desc: 'Spin for brightness', color: '#c0392b' },
      { id: 'dice', name: 'Dice of Doom', emoji: '🎲', desc: 'Roll for brightness chunks', color: '#16a085' },
    ]
  },
  {
    title: '🧠 Overcomplicated Logic',
    subtitle: 'Big brain required',
    games: [
      { id: 'logic', name: 'Logic Gates', emoji: '🔌', desc: 'AND/OR/XOR = brightness', color: '#2c3e50' },
      { id: 'math', name: 'Math Quiz Lux', emoji: '🧮', desc: 'Correct = small, Wrong = BIG', color: '#27ae60' },
      { id: 'captcha', name: 'Captcha Dimmer', emoji: '🤖', desc: 'Every mistake = darkness', color: '#7f8c8d' },
    ]
  },
  {
    title: '⏳ Time & Patience',
    subtitle: 'Torture simulator',
    games: [
      { id: 'countdown', name: 'Countdown to Light', emoji: '⏳', desc: 'Touch anything = reset', color: '#d35400' },
      { id: 'hold', name: 'Hold-to-Glow', emoji: '👆', desc: 'Release = back to zero', color: '#c0392b' },
      { id: 'afk', name: 'AFK Brightness', emoji: '💤', desc: "Don't move = brightness", color: '#34495e' },
    ]
  },
  {
    title: '🤡 Psychological Damage',
    subtitle: 'We are sorry in advance',
    games: [
      { id: 'peer', name: 'Peer Pressure', emoji: '😰', desc: '"Are you SURE?"', color: '#e74c3c' },
      { id: 'mood', name: 'Mood Selector', emoji: '🎭', desc: '"Cozy" = blinding', color: '#9b59b6' },
      { id: 'lie', name: 'Lie Detector', emoji: '🔍', desc: 'Lies = darkness', color: '#2c3e50' },
    ]
  },
  {
    title: '🖱️ UI Crimes',
    subtitle: 'UX designer nightmare',
    games: [
      { id: 'invisible', name: 'Invisible Slider', emoji: '👻', desc: 'Guess where it is!', color: '#95a5a6' },
      { id: 'reverse', name: 'Reverse Slider', emoji: '🔄', desc: 'Left = bright, Right = dark', color: '#1abc9c' },
      { id: 'nonlinear', name: 'Nonlinear Slider', emoji: '📈', desc: '90% nothing, 10% retina burn', color: '#e67e22' },
    ]
  },
  {
    title: '🔊 Sensory Crossovers',
    subtitle: 'Why does this exist?',
    games: [
      { id: 'voice', name: 'Voice Shout', emoji: '🎤', desc: 'SCREAM for brightness!', color: '#e74c3c' },
      { id: 'clap', name: 'Clap-to-Brighten', emoji: '👏', desc: 'Mic controls brightness', color: '#3498db' },
      { id: 'scroll', name: 'Scroll Wheel', emoji: '🖱️', desc: 'Scroll speed = brightness', color: '#8e44ad' },
      { id: 'typing', name: 'Typing Speed', emoji: '⌨️', desc: 'WPM = brightness', color: '#2ecc71' },
    ]
  },
];

export default function HomeScreen() {
  const router = useRouter();

  const handleGamePress = (gameId: string) => {
    router.push(`/game/${gameId}` as any);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>🔆 LUMEN LOTTERY 🔆</Text>
        <Text style={styles.tagline}>{"The World's Most Useless Brightness Controller"}</Text>
        <Text style={styles.description}>
          Why use a simple slider when you can play absurd minigames 
          that control your screen brightness through suffering?
        </Text>
      </View>

      {/* Scrollable Game List */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {GAME_CATEGORIES.map((category, catIndex) => (
          <View key={catIndex} style={styles.category}>
            <Text style={styles.categoryTitle}>{category.title}</Text>
            <Text style={styles.categorySubtitle}>{category.subtitle}</Text>
            
            <View style={styles.gamesGrid}>
              {category.games.map((game) => (
                <TouchableOpacity
                  key={game.id}
                  style={[styles.gameCard, { borderLeftColor: game.color }]}
                  onPress={() => handleGamePress(game.id)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.gameEmoji}>{game.emoji}</Text>
                  <View style={styles.gameInfo}>
                    <Text style={styles.gameName}>{game.name}</Text>
                    <Text style={styles.gameDesc}>{game.desc}</Text>
                  </View>
                  <Text style={styles.arrow}>›</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
        
        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>{'Made with 😈 for "Most Useless Hack"'}</Text>
          <Text style={styles.footerSubtext}>Your eyes will never forgive you</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a1a',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#0f0f23',
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a3e',
  },
  logo: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffd700',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: '#ffd700',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  tagline: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 12,
  },
  description: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    lineHeight: 18,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 40,
  },
  category: {
    marginBottom: 24,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  categorySubtitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  gamesGrid: {
    gap: 10,
  },
  gameCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
  },
  gameEmoji: {
    fontSize: 36,
    marginRight: 14,
  },
  gameInfo: {
    flex: 1,
  },
  gameName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  gameDesc: {
    fontSize: 12,
    color: '#888',
  },
  arrow: {
    fontSize: 24,
    color: '#444',
    fontWeight: 'bold',
  },
  footer: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#1a1a3e',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#ffd700',
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 12,
    color: '#444',
  },
});
