// App Navigator
// Stack navigation: Home → Game
//
// TODO: Install navigation packages first:
// npx expo install @react-navigation/native @react-navigation/native-stack react-native-screens react-native-safe-area-context

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// TODO: Uncomment after installing navigation packages
/*
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import GameScreen from '../screens/GameScreen';

export type RootStackParamList = {
  Home: undefined;
  Game: { gameId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Game" component={GameScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
*/

// Temporary placeholder until navigation is set up
export default function AppNavigator() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Navigation not yet configured</Text>
      <Text style={styles.hint}>Run: npx expo install @react-navigation/native @react-navigation/native-stack react-native-screens react-native-safe-area-context</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f0f23',
    padding: 20,
  },
  text: {
    color: '#fff',
    fontSize: 18,
    marginBottom: 10,
  },
  hint: {
    color: '#888',
    fontSize: 12,
    textAlign: 'center',
  },
});
