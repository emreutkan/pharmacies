import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import {
  useFonts,
  Poppins_300Light,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';
import * as SplashScreen from 'expo-splash-screen';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

// Define theme types
export type ThemeType = 'light' | 'dark' | 'system';

// Define spacing scale
const spacingScale = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Define typography scale
const typographyScale = {
  h1: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 32,
    lineHeight: 40,
  },
  h2: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 24,
    lineHeight: 32,
  },
  h3: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 20,
    lineHeight: 28,
  },
  subtitle: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 18,
    lineHeight: 24,
  },
  body: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 16,
    lineHeight: 24,
  },
  bodySmall: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    lineHeight: 20,
  },
  caption: {
    fontFamily: 'Poppins_300Light',
    fontSize: 12,
    lineHeight: 16,
  },
  button: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 16,
    lineHeight: 24,
  },
};

// Define light theme colors
const lightThemeColors = {
  primary: '#0a7ea4',
  primaryLight: '#5aafdb',
  primaryDark: '#005274',
  secondary: '#4CAF50',
  secondaryLight: '#80e27e',
  secondaryDark: '#087f23',
  background: '#ffffff',
  surface: '#f5f5f5',
  error: '#B00020',
  text: {
    primary: '#333333',
    secondary: '#666666',
    tertiary: '#999999',
    inverse: '#ffffff',
  },
  border: '#e0e0e0',
  divider: '#eeeeee',
  shadow: 'rgba(0, 0, 0, 0.1)',
  overlay: 'rgba(0, 0, 0, 0.5)',
  success: '#4CAF50',
  warning: '#FFC107',
  info: '#2196F3',
};

// Define dark theme colors
const darkThemeColors = {
  primary: '#5aafdb',
  primaryLight: '#8de2ff',
  primaryDark: '#007faa',
  secondary: '#80e27e',
  secondaryLight: '#b4ffb0',
  secondaryDark: '#4caf50',
  background: '#121212',
  surface: '#1e1e1e',
  error: '#CF6679',
  text: {
    primary: '#ffffff',
    secondary: '#b3b3b3',
    tertiary: '#737373',
    inverse: '#333333',
  },
  border: '#333333',
  divider: '#2a2a2a',
  shadow: 'rgba(0, 0, 0, 0.3)',
  overlay: 'rgba(0, 0, 0, 0.7)',
  success: '#81c784',
  warning: '#FFD54F',
  info: '#64B5F6',
};

// Define radius scale for rounded corners
const radiusScale = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 9999,
  circle: '50%',
};

// Define app theme interface
export interface AppTheme {
  colors: typeof lightThemeColors;
  spacing: typeof spacingScale;
  typography: typeof typographyScale;
  radius: typeof radiusScale;
  isDark: boolean;
}

// Create theme context
interface ThemeContextType {
  theme: AppTheme;
  themeType: ThemeType;
  setThemeType: (type: ThemeType) => void;
  fontsLoaded: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Theme provider props
interface ThemeProviderProps {
  children: ReactNode | ((context: ThemeContextType) => ReactNode);
  initialThemeType?: ThemeType;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  initialThemeType = 'system'
}) => {
  // Load fonts
  const [fontsLoaded] = useFonts({
    Poppins_300Light,
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  // Get device color scheme
  const colorScheme = useColorScheme();
  const [themeType, setThemeType] = useState<ThemeType>(initialThemeType);

  // Determine if we should use dark mode
  const shouldUseDarkMode = themeType === 'system'
    ? colorScheme === 'dark'
    : themeType === 'dark';

  // Create the theme object
  const theme: AppTheme = {
    colors: shouldUseDarkMode ? darkThemeColors : lightThemeColors,
    spacing: spacingScale,
    typography: typographyScale,
    radius: radiusScale,
    isDark: shouldUseDarkMode,
  };

  // Hide splash screen once fonts are loaded
  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  const contextValue = { theme, themeType, setThemeType, fontsLoaded };

  return (
    <ThemeContext.Provider value={contextValue}>
      {typeof children === 'function' ? children(contextValue) : children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use the theme
export const useAppTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useAppTheme must be used within a ThemeProvider');
  }
  return context;
};
