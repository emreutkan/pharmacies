import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, Image, Animated, ActivityIndicator } from 'react-native';
import { LocationService } from '@/services/LocationService';

interface EntryScreenProps {
  onEntryComplete: () => void;
}

export const EntryScreen: React.FC<EntryScreenProps> = ({ onEntryComplete }) => {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [loadingText, setLoadingText] = useState('Initializing...');

  useEffect(() => {
    // Start fade-in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    // Initialize app data and check permissions
    const initializeApp = async () => {
      // Wait for animation
      await new Promise(resolve => setTimeout(resolve, 1000));

      try {
        // Check if we have stored location data
        setLoadingText('Checking location data...');
        const savedCoords = await LocationService.getSavedCoordinates();

        // Wait a bit to show the checking message
        await new Promise(resolve => setTimeout(resolve, 800));

        if (savedCoords) {
          setLoadingText('Location data found!');
        } else {
          setLoadingText('Ready to find pharmacies!');
        }

        // Wait a moment then notify parent that entry is complete
        await new Promise(resolve => setTimeout(resolve, 800));
        onEntryComplete();
      } catch (error) {
        console.error('Error during app initialization:', error);
        setLoadingText('Ready to start');
        // Continue to main app even on error
        setTimeout(onEntryComplete, 1000);
      }
    };

    initializeApp();
  }, [fadeAnim, onEntryComplete]);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.content}>
        <Image
          source={require('../assets/images/icon.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>Pharmacy Finder</Text>
        <Text style={styles.subtitle}>Find pharmacies in Izmir, Turkey</Text>
        <ActivityIndicator size="large" color="#0a7ea4" style={styles.loader} />
        <Text style={styles.loadingText}>{loadingText}</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    padding: 20,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0a7ea4',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 40,
    textAlign: 'center',
  },
  loader: {
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
});
