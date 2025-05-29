import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, Image, Animated, ActivityIndicator } from 'react-native';
import { LocationService } from '@/services/LocationService';
import { PharmacyService } from '@/services/PharmacyService';
import { useAppTheme } from '@/theme/ThemeProvider';
import { createThemedStyles } from '@/theme/themeUtils';
import { useAppDispatch, useAppSelector } from '@/store';
import { fetchPharmacies } from '@/store/slices/pharmacySlice';

interface EntryScreenProps {
  onEntryComplete: () => void;
}

export const EntryScreen: React.FC<EntryScreenProps> = ({ onEntryComplete }) => {
  const { theme } = useAppTheme();
  const styles = getStyles(theme);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [loadingText, setLoadingText] = useState('Initializing...');

  const dispatch = useAppDispatch();
  const { loading, initialized } = useAppSelector(state => state.pharmacy);

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

        // Check saved coordinates
        const savedCoords = await LocationService.getSavedCoordinates()
          .catch(err => {
            console.error('Error checking saved coordinates:', err);
            return null; // Return null on error to continue execution
          });

        // Dispatch pharmacy loading action
        dispatch(fetchPharmacies());

        // Set appropriate loading text based on location status
        if (savedCoords) {
          setLoadingText('Location found, loading pharmacies...');
        } else {
          setLoadingText('Ready to start!');
        }

        // Short delay to ensure user sees loading message
        setTimeout(() => {
          if (!loading) {
            onEntryComplete();
          }
        }, 300);
      } catch (error) {
        console.error('Error during app initialization:', error);
        // Continue to main app even on error
        setLoadingText('Ready to start');
        setTimeout(onEntryComplete, 300);
      }
    };

    // Start initializing
    initializeApp();

    // If pharmacies are already loaded, complete the entry screen
    if (initialized && !loading) {
      setTimeout(onEntryComplete, 300);
    }
  }, [fadeAnim, onEntryComplete, dispatch, initialized, loading]);

  // If loading completes, complete the entry screen
  useEffect(() => {
    if (initialized && !loading) {
      setTimeout(onEntryComplete, 300);
    }
  }, [loading, initialized, onEntryComplete]);

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
        <ActivityIndicator size="large" color={theme.colors.primary} style={styles.loader} />
        <Text style={styles.loadingText}>{loadingText}</Text>
      </View>
    </Animated.View>
  );
};

const getStyles = createThemedStyles((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: theme.spacing.lg,
  },
  title: {
    ...theme.typography.h1,
    color: theme.colors.primary,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    ...theme.typography.subtitle,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xl,
    textAlign: 'center',
  },
  loader: {
    marginBottom: theme.spacing.md,
  },
  loadingText: {
    ...theme.typography.body,
    color: theme.colors.text.primary,
  },
}));
