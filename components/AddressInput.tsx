import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, Text, ActivityIndicator, Alert } from 'react-native';
import { LocationService } from '@/services/LocationService';
import { useAppTheme } from '@/theme/ThemeProvider';
import { createThemedStyles } from '@/theme/themeUtils';

interface AddressInputProps {
  onAddressSaved: (coords: { latitude: number; longitude: number }, address: string) => void;
}

export const AddressInput = ({ onAddressSaved }: AddressInputProps) => {
  const { theme } = useAppTheme();
  const styles = getStyles(theme);
  const [address, setAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [savedAddress, setSavedAddress] = useState<string | null>(null);

  useEffect(() => {
    const loadSavedAddress = async () => {
      const addr = await LocationService.getUserAddress();
      if (addr) {
        setSavedAddress(addr);
        setAddress(addr);
      }
    };

    loadSavedAddress();
  }, []);

  const handleSubmit = async () => {
    if (!address.trim()) {
      Alert.alert('Error', 'Please enter an address');
      return;
    }

    setIsLoading(true);

    try {
      const coords = await LocationService.geocodeAddress(address);

      if (coords) {
        await LocationService.saveUserAddress(address);
        onAddressSaved(coords, address);
      } else {
        Alert.alert('Error', 'Could not find coordinates for this address. Please try again with a more specific address.');
      }
    } catch (error) {
      console.error('Error geocoding address:', error);
      Alert.alert('Error', 'Failed to process your address. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Enter your address:</Text>
      <TextInput
        style={styles.input}
        value={address}
        onChangeText={setAddress}
        placeholder="Enter your address"
        placeholderTextColor={theme.colors.text.tertiary}
        autoCapitalize="none"
      />

      {savedAddress && (
        <Text style={styles.savedAddressText}>
          Last used: {savedAddress}
        </Text>
      )}

      <TouchableOpacity
        style={styles.submitButton}
        onPress={handleSubmit}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color={theme.colors.text.inverse} />
        ) : (
          <Text style={styles.submitButtonText}>Find Pharmacies</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const getStyles = createThemedStyles((theme) => ({
  container: {
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
    margin: theme.spacing.md,
    borderRadius: theme.radius.md,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  label: {
    ...theme.typography.body,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  input: {
    ...theme.typography.body,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    color: theme.colors.text.primary,
  },
  submitButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radius.md,
    alignItems: 'center',
  },
  submitButtonText: {
    ...theme.typography.button,
    color: theme.colors.text.inverse,
  },
  savedAddressText: {
    ...theme.typography.bodySmall,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.md,
    fontStyle: 'italic',
  }
}));
