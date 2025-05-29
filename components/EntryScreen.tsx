import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, Image, Animated, ActivityIndicator } from 'react-native';
import { LocationService } from '@/services/LocationService';
import { PharmacyService } from '@/services/PharmacyService';

interface EntryScreenProps {
  onEntryComplete: () => void;
}

export const EntryScreen: React.FC<EntryScreenProps> = ({ onEntryComplete }) => {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [loadingText, setLoadingText] = useState('Initializing...');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Start fade-in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500, // Reduced from 1000ms to 500ms for faster startup
      useNativeDriver: true,
    }).start();

    // Initialize app data and check permissions
    const initializeApp = async () => {
      try {
        // Check if we have location data and fetch pharmacy data in parallel
        setLoadingText('Loading data...');

        // Create an array of promises for tasks that need to be completed
        const tasks = [];

        // Task 1: Check saved coordinates
        const coordsPromise = LocationService.getSavedCoordinates()
          .catch(err => {
            console.error('Error checking saved coordinates:', err);
            return null; // Return null on error to continue execution
          });
        tasks.push(coordsPromise);

        // Task 2: Pre-fetch pharmacy data
        const pharmaciesPromise = PharmacyService.getAllPharmacies()
          .catch(err => {
            console.error('Error pre-fetching pharmacies:', err);
            return null; // Return null on error to continue execution
          });
        tasks.push(pharmaciesPromise);

        // Wait for both tasks to complete
        const [savedCoords, pharmacies] = await Promise.all(tasks);

        // If we have location data and pharmacies, we're good to go
        if (savedCoords && pharmacies) {
          setLoadingText('Data loaded successfully!');
          // Brief pause to show success message
          setTimeout(onEntryComplete, 300);
        } else if (savedCoords) {
          setLoadingText('Location found, loading pharmacies...');
          // Try to fetch pharmacies again if it failed
          try {
            await PharmacyService.getAllPharmacies();
            setLoadingText('Ready!');
            setTimeout(onEntryComplete, 300);
          } catch {
            // Proceed even on error
            setLoadingText('Ready to find pharmacies!');
            setTimeout(onEntryComplete, 300);
          }
        } else {
          // No saved location, but we can still proceed
          setLoadingText('Ready to start!');
          setTimeout(onEntryComplete, 300);
        }
      } catch (error) {
        console.error('Error during app initialization:', error);
        // Continue to main app even on error
        setLoadingText('Ready to start');
        setTimeout(onEntryComplete, 300);
      } finally {
        setIsLoading(false);
      }
    };

    // Immediately start initializing - no artificial delays
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
        {isLoading && (
          <ActivityIndicator size="large" color="#0a7ea4" style={styles.loader} />
        )}
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
    color: '#333',
  },
});
