import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
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
    ]
  },
  {
    title: '🖱️ UI Crimes',
    subtitle: 'UX designer nightmare',
    games: [
      { id: 'invisible', name: 'Invisible Slider', emoji: '👻', desc: 'Guess where it is!', color: '#95a5a6' },
      { id: 'nonlinear', name: 'Nonlinear Slider', emoji: '📈', desc: '90% nothing, 10% retina burn', color: '#e67e22' },
    ]
  },
  {
    title: '🔊 Sensory Crossovers',
    subtitle: 'Why does this exist?',
    games: [
      { id: 'voice', name: 'Voice Shout', emoji: '🎤', desc: 'SCREAM for brightness!', color: '#e74c3c' },
      { id: 'typeracer', name: 'Type Racer', emoji: '⌨️', desc: 'WPM = brightness', color: '#2ecc71' },
      { id: 'mines', name: 'Mine Sweeper', emoji: '💣', desc: 'Click safely to brighten', color: '#e74c3c' },
    ]
  },
];

// Count total games
const TOTAL_GAMES = GAME_CATEGORIES.reduce((acc, cat) => acc + cat.games.length, 0);

export default function HomeScreen() {
  const router = useRouter();

  const handleGamePress = (gameId: string) => {
    router.push(`/game/${gameId}` as any);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header with Gradient */}
      <LinearGradient
        colors={['#1a1a3e', '#0f0f23', '#0a0a1a']}
        style={styles.header}
      >
        <View style={styles.logoContainer}>
          <Text style={styles.logoIcon}>💡</Text>
          <Text style={styles.logo}>LUMEN LOTTERY</Text>
        </View>
        <View style={styles.taglineContainer}>
          <View style={styles.taglineLine} />
          <Text style={styles.tagline}>Brightness Through Suffering</Text>
          <View style={styles.taglineLine} />
        </View>
        <Text style={styles.description}>
          {TOTAL_GAMES} absurd ways that control your screen brightness
        </Text>
        <View style={styles.statsRow}>
          <View style={styles.statBadge}>
            <Text style={styles.statNumber}>{TOTAL_GAMES}</Text>
            <Text style={styles.statLabel}>Games</Text>
          </View>
          <View style={styles.statBadge}>
            <Text style={styles.statNumber}>{GAME_CATEGORIES.length}</Text>
            <Text style={styles.statLabel}>Categories</Text>
          </View>
          <View style={styles.statBadge}>
            <Text style={styles.statNumber}>∞</Text>
            <Text style={styles.statLabel}>Chaos</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Scrollable Game List */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {GAME_CATEGORIES.map((category, catIndex) => (
          <View key={catIndex} style={styles.category}>
            <View style={styles.categoryHeader}>
              <Text style={styles.categoryTitle}>{category.title}</Text>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryBadgeText}>{category.games.length}</Text>
              </View>
            </View>
            <Text style={styles.categorySubtitle}>{category.subtitle}</Text>
            
            <View style={styles.gamesGrid}>
              {category.games.map((game) => (
                <TouchableOpacity
                  key={game.id}
                  style={styles.gameCard}
                  onPress={() => handleGamePress(game.id)}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={[game.color + '20', 'transparent']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.gameCardGradient}
                  >
                    <View style={[styles.gameAccent, { backgroundColor: game.color }]} />
                    <View style={styles.gameEmojiContainer}>
                      <Text style={styles.gameEmoji}>{game.emoji}</Text>
                    </View>
                    <View style={styles.gameInfo}>
                      <Text style={styles.gameName}>{game.name}</Text>
                      <Text style={styles.gameDesc}>{game.desc}</Text>
                    </View>
                    <View style={[styles.arrowContainer, { backgroundColor: game.color + '30' }]}>
                      <Text style={[styles.arrow, { color: game.color }]}>→</Text>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
        
        {/* Footer */}
        <View style={styles.footer}>
          <LinearGradient
            colors={['transparent', '#0f0f23']}
            style={styles.footerGradient}
          >
            <View style={styles.footerContent}>
              <View style={styles.footerDivider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerIcon}>⚡</Text>
                <View style={styles.dividerLine} />
              </View>
              
              <Text style={styles.footerTitle}>LUMEN LOTTERY</Text>
              <Text style={styles.footerEvent}>Hack&Roll 2025</Text>
              
              <View style={styles.footerTagline}>
                <Text style={styles.footerTaglineText}>
                  Because adjusting brightness should never be easy
                </Text>
              </View>
              
              <View style={styles.footerCredits}>
                <Text style={styles.footerMadeWith}>Crafted with</Text>
                <Text style={styles.footerHeart}>💡</Text>
                <Text style={styles.footerMadeWith}>and questionable decisions</Text>
              </View>
              
              <Text style={styles.footerCopyright}>© 2025 Team Lumen Lottery</Text>
            </View>
          </LinearGradient>
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
    paddingBottom: 24,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  logoIcon: {
    fontSize: 32,
    marginRight: 10,
  },
  logo: {
    fontSize: 26,
    fontWeight: '900',
    color: '#ffd700',
    letterSpacing: 2,
    textShadowColor: '#ffd700',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
  },
  taglineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  taglineLine: {
    height: 1,
    width: 40,
    backgroundColor: '#333',
  },
  tagline: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
    fontStyle: 'italic',
    marginHorizontal: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  description: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
  },
  statBadge: {
    backgroundColor: '#1a1a2e',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2a2a4e',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffd700',
  },
  statLabel: {
    fontSize: 10,
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 20,
  },
  category: {
    marginBottom: 28,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  categoryBadge: {
    backgroundColor: '#ffd700',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 10,
  },
  categoryBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0a0a1a',
  },
  categorySubtitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 14,
    fontStyle: 'italic',
  },
  gamesGrid: {
    gap: 12,
  },
  gameCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  gameCardGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#12121f',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1f1f35',
  },
  gameAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  gameEmojiContainer: {
    width: 50,
    height: 50,
    backgroundColor: '#1a1a2e',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  gameEmoji: {
    fontSize: 28,
  },
  gameInfo: {
    flex: 1,
  },
  gameName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  gameDesc: {
    fontSize: 12,
    color: '#777',
  },
  arrowContainer: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrow: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    marginTop: 10,
  },
  footerGradient: {
    paddingTop: 30,
  },
  footerContent: {
    alignItems: 'center',
    paddingBottom: 30,
  },
  footerDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  dividerLine: {
    height: 1,
    width: 60,
    backgroundColor: '#2a2a4e',
  },
  dividerIcon: {
    fontSize: 20,
    marginHorizontal: 15,
  },
  footerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffd700',
    letterSpacing: 3,
    marginBottom: 6,
  },
  footerEvent: {
    fontSize: 14,
    color: '#4a9eff',
    fontWeight: '600',
    marginBottom: 16,
  },
  footerTagline: {
    backgroundColor: '#1a1a2e',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2a2a4e',
  },
  footerTaglineText: {
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  footerCredits: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  footerMadeWith: {
    fontSize: 12,
    color: '#555',
  },
  footerHeart: {
    fontSize: 14,
    marginHorizontal: 6,
  },
  footerCopyright: {
    fontSize: 10,
    color: '#333',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
