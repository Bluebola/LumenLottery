// Home Screen
// This is the main menu where users select a minigame

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

// TODO: Import navigation when set up
// import { useNavigation } from '@react-navigation/native';

interface GameCard {
  id: string;
  name: string;
  emoji: string;
  description: string;
  developer: string;
}

// Add your minigames here!
const MINIGAMES: GameCard[] = [
  {
    id: 'typeracer',
    name: 'Type Racer',
    emoji: '⌨️',
    description: 'WPM controls brightness',
    developer: 'Ethan',
  },
  {
    id: 'mines',
    name: 'Mine Sweeper',
    emoji: '💣',
    description: 'Click safely to brighten',
    developer: 'Ethan',
  },
  {
    id: 'snake',
    name: 'Snake',
    emoji: '🐍',
    description: 'Snake length = Brightness',
    developer: 'TBD',
  },
  {
    id: 'seesaw',
    name: 'Seesaw',
    emoji: '⚖️',
    description: 'Balance for brightness (impossible)',
    developer: 'TBD',
  },
  {
    id: 'slots',
    name: 'Slot Machine',
    emoji: '🎰',
    description: 'Gamble your eyesight',
    developer: 'TBD',
  },
  {
    id: 'flappybright',
    name: 'Flappy Bright',
    emoji: '🐦',
    description: 'Your death score = Brightness %',
    developer: 'Lumen Lottery Team',
  },
];

export default function HomeScreen() {
  // TODO: Implement navigation to GameScreen
  const handleSelectGame = (gameId: string) => {
    console.log('Selected game:', gameId);
    // navigation.navigate('Game', { gameId });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔆 Lumen Lottery 🔆</Text>
      <Text style={styles.subtitle}>The Worlds Most Useless Brightness Controller</Text>
      
      <ScrollView style={styles.gameList} contentContainerStyle={styles.gameListContent}>
        {MINIGAMES.map((game) => (
          <TouchableOpacity
            key={game.id}
            style={styles.gameCard}
            onPress={() => handleSelectGame(game.id)}
          >
            <Text style={styles.gameEmoji}>{game.emoji}</Text>
            <View style={styles.gameInfo}>
              <Text style={styles.gameName}>{game.name}</Text>
              <Text style={styles.gameDescription}>{game.description}</Text>
              <Text style={styles.gameDeveloper}>by {game.developer}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TouchableOpacity style={styles.resetButton}>
        <Text style={styles.resetButtonText}>🔄 Reset Brightness</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f23',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffd700',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginBottom: 30,
    fontStyle: 'italic',
  },
  gameList: {
    flex: 1,
  },
  gameListContent: {
    paddingBottom: 20,
  },
  gameCard: {
    flexDirection: 'row',
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  gameEmoji: {
    fontSize: 48,
    marginRight: 16,
  },
  gameInfo: {
    flex: 1,
  },
  gameName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  gameDescription: {
    fontSize: 14,
    color: '#aaa',
    marginBottom: 4,
  },
  gameDeveloper: {
    fontSize: 12,
    color: '#666',
  },
  resetButton: {
    backgroundColor: '#e74c3c',
    padding: 16,
    borderRadius: 12,
    marginBottom: 30,
    alignItems: 'center',
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
