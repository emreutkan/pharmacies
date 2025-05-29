import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import React, { useState, useEffect, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { EntryScreen } from '@/components/EntryScreen';

import { useColorScheme } from '@/hooks/useColorScheme';
import { ThemeProvider, useAppTheme } from '@/theme/ThemeProvider';

// Wrap navigation with our theme
function ThemedApp() {
  // Get theme from our custom provider
  const { theme } = useAppTheme();

  // Map our theme to React Navigation theme
  const navigationTheme = {
    ...(theme.isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(theme.isDark ? DarkTheme.colors : DefaultTheme.colors),
      // Override with our theme colors
      primary: theme.colors.primary,
      background: theme.colors.background,
      card: theme.colors.surface,
      text: theme.colors.text.primary,
      border: theme.colors.border,
    },
  };

  return (
    <NavigationThemeProvider value={navigationTheme}>
      <StatusBar style={theme.isDark ? 'light' : 'dark'} />
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
    </NavigationThemeProvider>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [showEntryScreen, setShowEntryScreen] = useState(true);
  const [appState, setAppState] = useState<AppStateStatus>(AppState.currentState);

  // Handle app state changes (background, active, etc.)
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      // When the app comes back from background to active
      if (
        appState.match(/inactive|background/) &&
        nextAppState === 'active' &&
        !showEntryScreen
      ) {
        // Only show entry screen if app was in background for a while (10+ seconds)
        setShowEntryScreen(true);
      }

      setAppState(nextAppState);
    });

    // Cleanup subscription on unmount
    return () => {
      subscription.remove();
    };
  }, [appState, showEntryScreen]);

  // Handler for when entry screen completes its animation and initialization
  const handleEntryComplete = useCallback(() => {
    setShowEntryScreen(false);
  }, []);

  // Show entry screen on first launch or when returning from background
  if (showEntryScreen) {
    return <EntryScreen onEntryComplete={handleEntryComplete} />;
  }

  return (
    <ThemeProvider initialThemeType="system">
      <ThemedApp />
    </ThemeProvider>
  );
}
