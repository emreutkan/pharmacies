import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, Text, ActivityIndicator, Alert } from 'react-native';
import { LocationService } from '@/services/LocationService';

interface AddressInputProps {
  onAddressSaved: (coords: { latitude: number; longitude: number }, address: string) => void;
}

export const AddressInput = ({ onAddressSaved }: AddressInputProps) => {
  const [address, setAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [savedAddress, setSavedAddress] = useState<string | null>(null);

  useEffect(() => {
    // Load any previously saved address on component mount
    const loadSavedAddress = async () => {
      const addr = await LocationService.getUserAddress();
      if (addr) {
        setSavedAddress(addr);
        setAddress(addr); // Also set it in the input field
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
      // Save the address text
      await LocationService.saveUserAddress(address);

      // Get coordinates from the address
      const coords = await LocationService.geocodeAddress(address);

      if (coords) {
        setSavedAddress(address);
        onAddressSaved(coords, address); // Pass both coordinates and address text
      } else {
        Alert.alert('Error', 'Could not find this address. Please try again with a more specific address.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to save address. Please try again.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {savedAddress ? (
        <View style={styles.savedAddressContainer}>
          <Text style={styles.savedAddressLabel}>Your saved address:</Text>
          <Text style={styles.savedAddressText}>{savedAddress}</Text>
          <TouchableOpacity
            style={styles.changeButton}
            onPress={() => setSavedAddress(null)}
          >
            <Text style={styles.changeButtonText}>Change Address</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <Text style={styles.label}>
            Please enter your address to find nearby pharmacies:
          </Text>
          <TextInput
            style={styles.input}
            value={address}
            onChangeText={setAddress}
            placeholder="Enter your address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TouchableOpacity
            style={styles.button}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.buttonText}>Find Pharmacies</Text>
            )}
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 12,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#0a7ea4',
    padding: 14,
    borderRadius: 4,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  savedAddressContainer: {
    alignItems: 'center',
    padding: 8,
  },
  savedAddressLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  savedAddressText: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 12,
  },
  changeButton: {
    paddingVertical: 8,
  },
  changeButtonText: {
    color: '#0a7ea4',
    fontWeight: '500',
  },
});
